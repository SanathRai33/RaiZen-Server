const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, requestPasswordReset, resetPassword, getCart, updateCart, getAllCarts, updateWishlist, getWishlist } = 
require('../controllers/userController');
const protect = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.get('/:id/cart', getCart);
router.put('/:id/cart', updateCart);
router.get('/carts', getAllCarts);
router.post('/wishlist/:id', protect, updateWishlist);
router.put('/wishlist/:id', protect, updateWishlist);
router.get('/wishlist', protect, getWishlist);


module.exports = router;
