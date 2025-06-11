const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const getLoginHtml = require("../utils/getLoginHtml");

// ⏳ JWT helper
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in env");

  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    secret,
    { expiresIn: "7d" }
  );
};

// ✅ Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, address = {} } = req.body;

    // Check if user already exists by email or phone
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already in use" });
    }

    // Create and save new user
    const newUser = new User({
      name,
      email,
      phone,
      password,
      address,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        address: newUser.address,
      },
      token: generateToken(newUser),
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// ✅ Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Optional: Send login notification
    await sendEmail({
      to: email,
      subject: "RaiZen Login Alert",
      text: `Hi ${user.name}, you just logged into your RaiZen account.`,
      html: getLoginHtml(user.name),
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token: generateToken(user),
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ Get Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("❌ Get Profile Error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

// ✅ Update Profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    res.status(500).json({ message: "Update failed", error });
  }
};

// ✅ Request Password Reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 mins
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Reset your password using the following link: ${resetUrl}`,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("❌ Password Reset Request Error:", error);
    res.status(500).json({ message: "Failed to send reset link" });
  }
};

// ✅ Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token is invalid or expired" });

    user.password = password; // bcrypt will hash it automatically
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("❌ Password Reset Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// GET Cart
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("cart.productId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ cart: user.cart });
  } catch (error) {
    console.error("Error fetching cart:", error.message);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// UPDATE Cart
const updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clear the old cart and replace it with the new one
    user.cart = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      addedAt: new Date(),
    }));

    await user.save();
    res.json({ message: 'Cart updated successfully', cart: user.cart });
  } catch (error) {
    console.error('Error updating cart:', error.message);
    res.status(500).json({ message: 'Failed to update cart' });
  }
};


// Get All Carts
const getAllCarts = async (req, res) => {
  try {
    const users = await User.find().populate("cart.productId");
    const carts = users.map((user) => ({
      userId: user._id,
      cart: user.cart,
    }));
    res.json(carts);
  } catch (error) {
    console.error("Error fetching all carts:", error.message);
    res.status(500).json({ message: "Failed to fetch all carts" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
  getCart,
  getAllCarts,
  updateCart,
};
