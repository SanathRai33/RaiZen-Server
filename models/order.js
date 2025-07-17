const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId,
  items,
  shippingAddress,
  totalAmount,
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  status: "pending" | "shipped" | "delivered",
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
