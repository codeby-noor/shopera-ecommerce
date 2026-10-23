const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  syncCart
} = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

// All cart operations require authentication
router.use(verifyToken);

router.get('/', getCart);
router.post('/', addToCart);
router.post('/sync', syncCart);
router.put('/:id', updateQuantity);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
