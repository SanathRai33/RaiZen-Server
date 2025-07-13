const express = require('express');
const router = express.Router();
const { createProduct, getProductById, getAllProducts, getNewArrivals, getActiveOffers, updateProduct, deleteProduct, addReview } = require('../controllers/productController.js');


// CREATE a new product
router.post('/insert', createProduct);

// GET all products
router.get('/', getAllProducts);

// GET a single product by ID
router.get('/:id', getProductById);

// UPDATE a product by ID
router.put('/:id', updateProduct);

// DELETE a product by ID
router.delete('/:id', deleteProduct);

// ADD a review to a product
router.post('/:id/reviews', addReview);

// GET active products (products with active discounts)
router.get('/filter/offer/products', getActiveOffers);

// GET new arrivals (added within last 3 days)
router.get('/filter/new-arrivals', getNewArrivals);

module.exports = router;
