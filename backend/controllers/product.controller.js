import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

// Get all products
// No caching, direct database query
// Handles errors and sends appropriate responses
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); //find all products
    res.json({ products });
  } catch (error) {
    console.log("Error in getAllProducts", error.Product);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get featured products with caching
// Checks Redis cache first before querying database
// Uses .lean() for performance optimization
// Caches results in Redis for future requests
export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    // If not in cache, fetch from database
    // .lean() returns plain JavaScript objects instead of Mongoose documents
    // This improves performance when you don't need Mongoose document methods
    // wich is good for read-only operations like this one

    featuredProducts = await Product.find({ isfeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    // Store in Redis cache for future requests
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      impage: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.log("Error in createProduct", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete product by ID
// Also deletes associated image from Cloudinary if exists
// Handles errors and non-existent products
// Logs actions for monitoring
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // Extract public ID from URL
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from Cloudinary");
      } catch (error) {
        console.log("Error deleting image from Cloudinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.log("Error in deleteProduct", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Get 3 random products for recommendations
// Uses MongoDB aggregation with $sample to fetch random documents
// Projects only necessary fields to reduce payload size
// Caches results in Redis for performance
export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get products by category
// No caching, direct database query
// Handles errors and sends appropriate responses
// Category is passed as a URL parameter
// Example: /category/electronics
// Returns all products matching the specified category
export const getproductesByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category }); //find all products
    res.json({ products });
  } catch (error) {
    console.log("Error in getproductesByCategory", error.Product);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Toggle the 'isfeatured' status of a product by ID
// Expects a boolean 'isfeatured' in the request body
// Updates the product and returns the updated document
// Also updates the Redis cache for featured products
// Handles errors and non-existent products
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to update the Redis cache for featured products
// Fetches the latest featured products from the database
// Uses .lean() for performance optimization
// Updates the Redis cache with the new list
async function updateFeaturedProductsCache() {
  try {
    // The Lean method is used to improve performance by returning plain JavaScript objects instead of Mongoose documents
    // This is beneficial for read-only operations like caching
    const featuredProducts = await Product.find({ isfeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error updating featured products cache");
  }
}
