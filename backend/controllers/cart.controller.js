//backend/controllers/cart.controller.js

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.productId.push(productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error adding to cart:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const getCartProducts = async (req, res) => {};
export const removeAllFromCart = async (req, res) => {};
export const updateQuantity = async (req, res) => {};
