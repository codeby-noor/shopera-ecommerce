const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderByIdOrNumber,
  cancelOrder,
  validateCoupon,
  trackOrderPublic,
  calculateOrderSummary
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validateMiddleware');

// Public endpoints (accessible to guests, tracking portal, and checkout)
router.post('/validate-coupon', validateCoupon);
router.get('/track/:orderNumber', trackOrderPublic);
router.post('/calculate-summary', calculateOrderSummary);

router.use(verifyToken);

router.post('/', validateOrder, createOrder);
router.get('/', getMyOrders);
router.get('/:idOrNumber', getOrderByIdOrNumber);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
