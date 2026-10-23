const db = require('../config/db');

// @desc    Get all products with search, filtering, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      category_id,
      brand,
      min_price,
      max_price,
      sort = 'newest',
      page = 1,
      limit = 12,
      featured,
      in_stock
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(60, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions = ['p.is_active = 1'];
    const params = [];

    // Search query matches title, description, SKU, brand, and category name
    if (q && q.trim()) {
      conditions.push('(p.title LIKE ? OR p.short_description LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)');
      const searchPattern = `%${q.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Category filter by ID or slug
    if (category_id) {
      conditions.push('p.category_id = ?');
      params.push(parseInt(category_id, 10));
    } else if (category && category !== 'all') {
      conditions.push('(c.slug = ? OR c.id = ?)');
      params.push(category, isNaN(category) ? -1 : parseInt(category, 10));
    }

    // Brand filter
    if (brand && brand !== 'all') {
      conditions.push('p.brand = ?');
      params.push(brand.trim());
    }

    // Price range
    if (min_price && !isNaN(min_price)) {
      conditions.push('p.price >= ?');
      params.push(parseFloat(min_price));
    }
    if (max_price && !isNaN(max_price)) {
      conditions.push('p.price <= ?');
      params.push(parseFloat(max_price));
    }

    // Featured filter
    if (featured === 'true' || featured === '1') {
      conditions.push('p.is_featured = 1');
    }

    // Stock availability filter
    if (in_stock === 'true' || in_stock === '1') {
      conditions.push('p.stock_quantity > 0');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderBy = 'p.created_at DESC';
    switch (sort) {
      case 'price_asc':
        orderBy = 'p.price ASC';
        break;
      case 'price_desc':
        orderBy = 'p.price DESC';
        break;
      case 'rating':
        orderBy = 'p.rating DESC, p.num_reviews DESC';
        break;
      case 'title_asc':
        orderBy = 'p.title ASC';
        break;
      case 'popular':
        orderBy = 'p.num_reviews DESC';
        break;
      default:
        orderBy = 'p.created_at DESC';
    }

    // Count total matches
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0].total;

    // Fetch paginated products
    const fetchSql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [products] = await db.query(fetchSql, [...params, limitNum, offset]);

    // Parse JSON fields (specifications, additional_images, variants) safely
    const formattedProducts = products.map(prod => {
      let specs = {};
      let addImages = [];
      let variants = null;
      try {
        specs = typeof prod.specifications === 'string' ? JSON.parse(prod.specifications) : (prod.specifications || {});
      } catch (e) {
        specs = {};
      }
      try {
        addImages = typeof prod.additional_images === 'string' ? JSON.parse(prod.additional_images) : (prod.additional_images || []);
      } catch (e) {
        addImages = [];
      }
      try {
        variants = typeof prod.variants === 'string' ? JSON.parse(prod.variants) : (prod.variants || null);
      } catch (e) {
        variants = null;
      }
      return {
        ...prod,
        specifications: specs,
        additional_images: addImages,
        variants
      };
    });

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top featured products for homepage
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.is_featured = 1
      ORDER BY p.rating DESC, p.created_at DESC
      LIMIT 12
    `);

    const formatted = products.map(prod => {
      let specs = {};
      let addImages = [];
      let variants = null;
      try { specs = JSON.parse(prod.specifications || '{}'); } catch (e) {}
      try { addImages = JSON.parse(prod.additional_images || '[]'); } catch (e) {}
      try { variants = JSON.parse(prod.variants || 'null'); } catch (e) {}
      return { ...prod, specifications: specs, additional_images: addImages, variants };
    });

    res.json({
      success: true,
      products: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:idOrSlug
// @access  Public
const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = !isNaN(idOrSlug);

    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'} AND p.is_active = 1
    `;

    const [rows] = await db.query(sql, [isNumeric ? parseInt(idOrSlug, 10) : idOrSlug]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = rows[0];

    // Parse JSON fields
    try { product.specifications = JSON.parse(product.specifications || '{}'); } catch (e) { product.specifications = {}; }
    try { product.additional_images = JSON.parse(product.additional_images || '[]'); } catch (e) { product.additional_images = []; }
    try { product.variants = typeof product.variants === 'string' ? JSON.parse(product.variants) : (product.variants || null); } catch (e) { product.variants = null; }

    // Fetch reviews for this product
    const [reviews] = await db.query(`
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        CASE 
          WHEN r.is_verified_purchase = 1 THEN 1 
          WHEN EXISTS (
            SELECT 1 FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            WHERE o.user_id = r.user_id 
              AND oi.product_id = r.product_id 
              AND o.payment_status = 'paid' 
              AND o.status IN ('delivered', 'shipped', 'processing')
          ) THEN 1 
          ELSE 0 
        END as is_verified_purchase,
        u.name as user_name, u.avatar_url as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [product.id]);

    product.reviews = reviews;

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products in the same category
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const [current] = await db.query('SELECT category_id FROM products WHERE id = ?', [productId]);
    if (current.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const categoryId = current[0].category_id;

    const [related] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
      ORDER BY p.rating DESC
      LIMIT 4
    `, [categoryId, productId]);

    res.json({
      success: true,
      products: related
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Live autocomplete search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, products: [], categories: [] });
    }
    const pattern = `%${q.trim()}%`;
    const [matchingProducts] = await db.query(`
      SELECT p.id, p.title, p.slug, p.price, p.discount_price, p.image_url, p.brand, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND (p.title LIKE ? OR p.brand LIKE ? OR p.sku LIKE ?)
      LIMIT 6
    `, [pattern, pattern, pattern]);

    const [matchingCategories] = await db.query(`
      SELECT id, name, slug, image_url
      FROM categories
      WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?)
      LIMIT 4
    `, [pattern, pattern]);

    res.json({
      success: true,
      products: matchingProducts,
      categories: matchingCategories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct brands for filter chips
// @route   GET /api/products/meta/brands
// @access  Public
const getBrands = async (req, res, next) => {
  try {
    const { category, category_id } = req.query;
    let sql = 'SELECT DISTINCT p.brand FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 AND p.brand IS NOT NULL';
    const params = [];

    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(parseInt(category_id, 10));
    } else if (category && category !== 'all') {
      sql += ' AND (c.slug = ? OR c.id = ?)';
      params.push(category, isNaN(category) ? -1 : parseInt(category, 10));
    }

    sql += ' ORDER BY p.brand ASC';
    const [rows] = await db.query(sql, params);
    const brands = rows.map(r => r.brand).filter(Boolean);

    res.json({ success: true, brands });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    if (!comment || comment.trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 4 characters.'
      });
    }

    // Check if product exists
    const [prodRows] = await db.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (prodRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // 1. Enforce verified purchase rule: Customer must have purchased this product
    // with order payment verified and status in ('delivered', 'shipped', 'processing')
    const [purchases] = await db.query(`
      SELECT o.id, o.status, o.payment_status
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
        AND oi.product_id = ?
        AND o.payment_status = 'paid'
        AND o.status IN ('delivered', 'shipped', 'processing')
      LIMIT 1
    `, [userId, productId]);

    if (purchases.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Verified purchase required: You can only review products you have purchased with an order status of processing, shipped, or delivered.'
      });
    }

    // 2. Prevent duplicate reviews from the same customer
    const [existingReview] = await db.query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );
    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product.'
      });
    }

    // 3. Insert review with is_verified_purchase = 1
    await db.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment, is_verified_purchase) VALUES (?, ?, ?, ?, 1)',
      [productId, userId, ratingNum, comment.trim()]
    );

    // Recalculate average rating & review count for the product
    const [avgRows] = await db.query(
      'SELECT AVG(rating) as avgRating, COUNT(id) as totalReviews FROM reviews WHERE product_id = ?',
      [productId]
    );

    const avgRating = parseFloat(avgRows[0].avgRating || 0).toFixed(2);
    const totalReviews = avgRows[0].totalReviews || 0;

    await db.query(
      'UPDATE products SET rating = ?, num_reviews = ? WHERE id = ?',
      [avgRating, totalReviews, productId]
    );

    res.status(201).json({
      success: true,
      message: 'Verified review submitted successfully!',
      rating: avgRating,
      num_reviews: totalReviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check whether customer is eligible to review a product (verified purchase rule)
// @route   GET /api/products/:id/review-eligibility
// @access  Private
const checkReviewEligibility = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.id, 10);

    // 1. Check if user already reviewed this product
    const [existing] = await db.query(
      'SELECT id, rating, comment, created_at FROM reviews WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        eligible: false,
        alreadyReviewed: true,
        userReview: existing[0],
        message: 'You have already submitted a review for this product.'
      });
    }

    // 2. Verified purchase rule: Must have paid order in processing, shipped, or delivered status
    const [purchases] = await db.query(`
      SELECT o.id, o.order_number, o.status, o.created_at
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
        AND oi.product_id = ?
        AND o.payment_status = 'paid'
        AND o.status IN ('delivered', 'shipped', 'processing')
      ORDER BY o.created_at DESC
      LIMIT 1
    `, [userId, productId]);

    if (purchases.length === 0) {
      return res.json({
        success: true,
        eligible: false,
        alreadyReviewed: false,
        message: 'Verified purchase required: Only customers who have ordered this product from SHOPERA are eligible to submit reviews.'
      });
    }

    return res.json({
      success: true,
      eligible: true,
      alreadyReviewed: false,
      order: purchases[0],
      message: 'Verified purchase confirmed. You are eligible to review this product.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  getSearchSuggestions,
  getBrands,
  addReview,
  checkReviewEligibility
};
