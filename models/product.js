// models/product.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Adjust if your user model is named differently
    required: true
  },
  username: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      required: true
    },
    subCategory: {
      type: String
    },
    brand: {
      type: String
    },
    stock: {
      type: Number,
      required: true
    },
    images: {
      type: [String],
      required: true
    },
    tags: {
      type: [String]
    },
    ratings: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    reviews: [reviewSchema],
    isFeatured: {
      type: Boolean,
      default: false
    },
    offerExpiresAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
