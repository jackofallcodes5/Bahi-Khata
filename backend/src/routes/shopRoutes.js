const express = require('express');
const { getDashboardStats, getProducts, addProduct, getShopCustomers, addShopCustomer } = require('../controllers/shopController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Retail Shop'));

router.get('/dashboard', getDashboardStats);
router.get('/products', getProducts);
router.post('/products', addProduct);
router.get('/customers', getShopCustomers);
router.post('/customers', addShopCustomer);
// Alias for inventory endpoint
router.get('/inventory', getProducts);

module.exports = router;
