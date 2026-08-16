const express = require('express');
const { 
    getCustomerDashboard, 
    getCustomerBills, 
    getCustomerSubscriptions, 
    getCustomerPayments, 
    payAll,
    pauseSubscription,
    requestExtra
} = require('../controllers/customerController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Customer'));

router.get('/dashboard', getCustomerDashboard);
router.get('/bills/:businessId', getCustomerBills);
router.get('/subscriptions', getCustomerSubscriptions);
router.post('/subscriptions/:id/pause', pauseSubscription);
router.post('/subscriptions/:id/extra', requestExtra);
router.get('/payments', getCustomerPayments);
router.post('/pay-all', payAll);

module.exports = router;
