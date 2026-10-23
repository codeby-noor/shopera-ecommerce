const db = require('../config/db');

// @desc    Get current user's cart items
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [items] = await db.query(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.created_at,
        p.id as product_id,
        p.title,
        p.slug,
        p.price,
        p.discount_price,
        p.image_url,
        p.stock_quantity,
        p.is_active,
        c.name as category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `, [userId]);

    // Calculate subtotal
    const subtotal = items.reduce((acc, item) => {
      const activePrice = item.discount_price !== null && item.discount_price > 0 ? Number(item.discount_price) : Number(item.price);
      return acc + (activePrice * item.quantity);
    }, 0);

    res.json({
      success: true,
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: parseFloat(subtotal.toFixed(2))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart or increment quantity
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity.' });
    }

    // Check product existence & stock
    const [prodRows] = await db.query(
      'SELECT id, title, stock_quantity, is_active FROM products WHERE id = ?',
      [productId]
    );

    if (prodRows.length === 0 || prodRows[0].is_active === 0) {
      return res.status(404).json({ success: false, message: 'Product is unavailable.' });
    }

    const product = prodRows[0];
    if (product.stock_quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock_quantity} unit(s) available in stock.`
      });
    }

    // Check if item is already in user's cart
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      const newTotalQty = existing[0].quantity + qty;
      if (newTotalQty > product.stock_quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. You have ${existing[0].quantity} in cart and only ${product.stock_quantity} total available.`
        });
      }

      await db.query(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newTotalQty, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, qty]
      );
    }

    // Return updated cart
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of an item in cart
// @route   PUT /api/cart/:id
// @access  Private
const updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.id, 10);
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    // Find cart item and joined product stock
    const [rows] = await db.query(`
      SELECT ci.id, ci.user_id, p.stock_quantity, p.title
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ?
    `, [cartItemId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const item = rows[0];
    if (qty > item.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds stock. Only ${item.stock_quantity} units available.`
      });
    }

    await db.query(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [qty, cartItemId]
    );

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.id, 10);

    await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [cartItemId, userId]);

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Cart cleared.',
      items: [],
      count: 0,
      subtotal: 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync guest local cart with database on login
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items = [] } = req.body;

    if (Array.isArray(items) && items.length > 0) {
      for (const guestItem of items) {
        if (!guestItem.productId) continue;
        const [prod] = await db.query(
          'SELECT stock_quantity, is_active FROM products WHERE id = ?',
          [guestItem.productId]
        );
        if (prod.length === 0 || prod[0].is_active === 0) continue;

        const maxStock = prod[0].stock_quantity;
        const [existing] = await db.query(
          'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
          [userId, guestItem.productId]
        );

        if (existing.length > 0) {
          const combinedQty = Math.min(existing[0].quantity + (guestItem.quantity || 1), maxStock);
          await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [combinedQty, existing[0].id]);
        } else {
          const insertQty = Math.min(guestItem.quantity || 1, maxStock);
          if (insertQty > 0) {
            await db.query(
              'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
              [userId, guestItem.productId, insertQty]
            );
          }
        }
      }
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  syncCart
};
