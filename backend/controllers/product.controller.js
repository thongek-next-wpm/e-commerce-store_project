import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const product = await Product.find({}); // get all products
    res.json({ product });
  } catch (error) {
    console.log("error in getAllProducts", error.message);
  }
};
