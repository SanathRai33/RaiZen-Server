// controllers/productController.js
const { get } = require("mongoose");
const Product = require("../models/product");

// CREATE product
const createProduct = async (req, res) => {
  try {
    const { price, discount } = req.body;
    const finalPrice = price - Math.floor(price * (discount / 100));
    const product = await Product.create({ ...req.body, finalPrice });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET all products or filtered by search
const getAllProducts = async (req, res) => {
  const { search, brand, min, max } = req.query;

  try {
    let query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $in: [regex] } },
        { subCategory: { $regex: regex } }
      ];
    }

    // Filter by brand (if present)
    if (brand) {
      const brandArray = brand.split(",");
      query.brand = { $in: brandArray };
    }

    // Filter by price range
    if (min || max) {
      query.price = {
        ...(min && { $gte: parseInt(min) }),
        ...(max && { $lte: parseInt(max) }),
      };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};


// GET single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE product
const updateProduct = async (req, res) => {
  try {
    const { price, discount } = req.body;
    const finalPrice =
      price && discount
        ? price - Math.floor(price * (discount / 100))
        : undefined;

    const updateData =
      finalPrice !== undefined ? { ...req.body, finalPrice } : req.body;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD review
const addReview = async (req, res) => {
  try {
    const { userId, username, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = { userId, username, rating, comment };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.numReviews;

    await product.save();
    res.status(201).json({ message: "Review added successfully", product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET products with active offers (offerExpiresAt > now)
const getActiveOffers = async (req, res) => {
  try {
    const offers = await Product.find({
      discount: { $gt: 19 },
      offerExpiresAt: { $gt: new Date() }
    });
    res.status(200).json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET newly added products (last 7 days)
const getNewArrivals = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

    const newArrivals = await Product.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }); // Optional: newest first

    res.status(200).json(newArrivals);
  } catch (err) {
    console.error("Error fetching new arrivals:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


module.exports = {
  createProduct,
  getProductById,
  getAllProducts,
  getActiveOffers,
  getNewArrivals,
  updateProduct,
  deleteProduct,
  addReview,
};
