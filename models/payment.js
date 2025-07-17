const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: { // Razorpay order ID
    type: String,
    required: true,
  },
  paymentId: { // Razorpay payment ID
    type: String,
    required: true,
  },
  signature: { // For verification (optional, but good to store)
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentStatus: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created',
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      name: String,
      price: Number,
      quantity: Number,
    }
  ],
  address: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
  },
  paymentMethod: {
    type: String,
    default: 'Razorpay',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
