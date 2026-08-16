const express = require('express');
const { generateBill, getBills, downloadBillPDF } = require('../controllers/billController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getBills)
    .post(generateBill);

router.get('/:id/pdf', downloadBillPDF);

module.exports = router;
