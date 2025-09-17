import Coupon from "../models/coupon.model.js";

// Controller to get the active coupon for the logged-in user
// GET /api/coupons
// Access: Private
// Retrieves the active coupon for the authenticated user
// If no active coupon exists, returns null
// Example response:
// {
//   "_id": "couponId",
//   "code": "DISCOUNT10",
//   "discount": 10,
//   "isActive": true,
//   "userId": "userId",
//   "createdAt": "2023-10-01T00:00:00.000Z",
//   "updatedAt": "2023-10-01T00:00:00.000Z"
// }

export const getCoupon = async (req, res) => {
  // Assuming req.user is populated by authentication middleware
  // Find the active coupon for the user
  // If no coupon is found, return null
  // Return the coupon details in the response
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    res.json(coupon || null);
  } catch (error) {
    // Handle errors
    console.log("Error in getCoupon controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Controller to validate a coupon code for the logged-in user
// GET /api/coupons/validate?code=COUPONCODE
// Access: Private
// Validates the provided coupon code for the authenticated user
// If the coupon is valid and active, returns the coupon details
// If the coupon is invalid or inactive, returns an error message
// Example response for valid coupon:
// {
//   "message": "Coupon code is valid",
//   "code": "DISCOUNT10",
//   "discountPercentage": 10
// }
// Example response for invalid coupon:
// {
//   "message": "Invalid or inactive coupon code"
// }

export const validateCoupon = async (req, res) => {
  // Assuming req.user is populated by authentication middleware
  // Get the coupon code from the query parameters
  // Find the coupon by code and userId
  // If the coupon is not found or inactive, return an error
  // If the coupon is found and active, return the coupon details
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });
    // If coupon not found or inactive
    // If coupon is expired, set isActive to false and return an error
    // If coupon is valid, return the coupon details
    if (!coupon) {
      return res
        .status(404)
        .json({ message: "Invalid or inactive coupon code" });
    }

    // Check if the coupon is expired
    // Assuming coupon has an expiryDate field
    // If expired, set isActive to false and return an error
    // If not expired, return the coupon details
    if (coupon.expiryDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon code has expired" });
    }

    // Coupon is valid
    // Return the coupon details
    // Example response:
    // {
    //   "message": "Coupon code is valid",
    //   "code": "DISCOUNT10",
    //   "discountPercentage": 10
    // }
    res.json({
      message: "Coupon code is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.log("Error in validateCoupon controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
