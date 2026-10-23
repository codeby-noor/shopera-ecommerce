const db = require('../config/db');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [items] = await db.query(`
      SELECT 
        w.id as wishlist_id,
        w.created_at,
        p.id,
        p.title,
        p.slug,
        p.price,
        p.discount_price,
        p.image_url,
        p.stock_quantity,
        p.rating,
        p.num_reviews,
        c.name as category_name
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ? AND p.is_active = 1
      ORDER BY w.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (Add if not in wishlist, remove if already in)
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const [existing] = await db.query(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    let inWishlist = false;
    let message = '';

    if (existing.length > 0) {
      await db.query('DELETE FROM wishlists WHERE id = ?', [existing[0].id]);
      inWishlist = false;
      message = 'Product removed from your wishlist.';
    } else {
      await db.query(
        'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      inWishlist = true;
      message = 'Product added to your wishlist.';
    }

    // Get updated total count
    const [countRows] = await db.query('SELECT COUNT(*) as total FROM wishlists WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      inWishlist,
      message,
      count: countRows[0].total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId, 10);

    await db.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);

    const [countRows] = await db.query('SELECT COUNT(*) as total FROM wishlists WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Removed from wishlist.',
      count: countRows[0].total
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist
};
