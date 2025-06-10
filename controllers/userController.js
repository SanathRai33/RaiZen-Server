const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require('../utils/sendEmail');
const getLoginHtml = require('../utils/getLoginHtml');

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
    const { name, email, phone, password, address } = req.body;

    // Check for existing user
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists)
      return res.status(400).json({ message: "Email or Phone already in use" });

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
        role: newUser.role,
      },
      token: generateToken(newUser),
    });
  } catch (error) {
    console.error("❌ Registration Error:", error.message, error.stack);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// ✅ Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Optional: Generate JWT token here and send to frontend

    // ✅ Send login email
    await sendEmail({
      to: email,
      subject: 'RaiZen Login Alert',
      text: `Hi ${user.name}, you just logged into your RaiZen account.`,
      html: getLoginHtml(user.name),
    });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ✅ Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user profile", error });
  }
};

// ✅ Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = { ...user.address, ...address };

    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = Date.now() + 1000 * 60 * 15; // 15 min

  user.resetToken = token;
  user.resetTokenExpiry = expiry;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Link",
    text: `Click to reset your password: ${resetUrl}`,
  });

  res.json({ message: "Reset link sent to email" });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Token invalid or expired" });

  user.password = password; // Will be hashed in pre-save
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully" });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
};
