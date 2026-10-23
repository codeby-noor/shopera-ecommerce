const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  getSearchSuggestions,
  getBrands,
  addReview,
  checkReviewEligibility
} = require('../controllers/productController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/meta/brands', getBrands);
router.get('/:id/review-eligibility', verifyToken, checkReviewEligibility);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', verifyToken, addReview);

module.exports = router;
