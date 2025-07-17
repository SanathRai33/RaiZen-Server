const razorpay = require('../utils/razorpayInstance');

const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_order_123' } = req.body;

    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ error: 'Server error while creating order' });
  }
};



module.exports = {
  createOrder,
};
    