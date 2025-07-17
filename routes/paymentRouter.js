const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const { createOrder, verifyPayment } = require('../controllers/paymentController.js');

// Initialize Razorpay instance
router.post('/create-order', createOrder);
// router.post('/verify-payment', verifyPayment);