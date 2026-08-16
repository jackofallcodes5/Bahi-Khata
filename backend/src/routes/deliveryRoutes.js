const express = require('express');
const { getTodaysRoute, markAttendance, getDeliveryCustomers, addDeliveryCustomer, calculateAndGenerateBill } = require('../controllers/deliveryController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
// Allow both Delivery Business and Service Provider
router.use(authorize('Delivery Business', 'Service Provider'));

router.get('/todays-route', getTodaysRoute);
router.post('/attendance', markAttendance);
router.get('/customers', getDeliveryCustomers);
router.post('/customers', addDeliveryCustomer);
router.post('/calculate-bill', calculateAndGenerateBill);

module.exports = router;
