const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist
} = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/authMiddleware');

// All wishlist routes require authentication
router.use(verifyToken);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
