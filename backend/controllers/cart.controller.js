import Product from "../models/product.model.js";


// Get all products in the user's cart with their quantities
// GET /api/cart
// Requires authentication
// Response: Array of products with quantities
// Example response:
// [
//   {
//     "_id": "productId1",
//     "name": "Product 1",
//     "description": "Description of Product 1",
//     "price": 100,
//     "quantity": 2
//   },
export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    // add quantity for each product
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add a product to the user's cart
// POST /api/cart
// Requires authentication
// Request body: { productId: String }
// Response: Updated cart items
// Example request body: { "productId": "productId1" }
// Example response:
// [
//   { "_id": "productId1", "name": "Product 1", "description": "Description of Product 1", "price": 100, "quantity": 2 },
//   { "_id": "productId2", "name": "Product 2", "description": "Description of Product 2", "price": 200, "quantity": 1 }
// ]

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Remove all products from the user's cart or a specific product if productId is provided
// DELETE /api/cart
// Requires authentication  
// Request body: { productId: String }
// Response: Updated cart items
// Example request body to remove all items: {}
// Example request body to remove a specific item: { "productId": "productId1" }
// Example response:
// [
//   { "_id": "productId2", "name": "Product 2", "description": "Description of Product 2", "price": 200, "quantity": 1 }
// ]
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update the quantity of a specific product in the user's cart
// PUT /api/cart/:id
// Requires authentication
// Request body: { quantity: Number }
// Response: Updated cart items
// Example request body: { "quantity": 3 }
// Example response:
// [
//   { "_id": "productId1", "name": "Product 1", "description": "Description of Product 1", "price": 100, "quantity": 3 },
//   { "_id": "productId2", "name": "Product 2", "description": "Description of Product 2", "price": 200, "quantity": 1 }
// ]
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
