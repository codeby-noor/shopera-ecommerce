const db = require('../config/db');

// @desc    Get all active categories with product counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const [categories] = await db.query(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query('SELECT * FROM categories WHERE slug = ? AND is_active = 1', [slug]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    res.json({
      success: true,
      category: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug
};
