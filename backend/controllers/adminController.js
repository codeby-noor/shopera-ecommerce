const db = require('../config/db');

// @desc    Get dashboard metrics, sales charts, inventory alerts
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Sales (excluding cancelled)
    const [salesRows] = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total_sales FROM orders WHERE status != 'cancelled'"
    );
    const totalSales = parseFloat(Number(salesRows[0].total_sales || 0).toFixed(2));

    // 2. Total Orders
    const [ordersCountRows] = await db.query('SELECT COUNT(*) as total_orders FROM orders');
    const totalOrders = ordersCountRows[0].total_orders;

    // 3. Total Customers
    const [customersCountRows] = await db.query("SELECT COUNT(*) as total_customers FROM users WHERE role = 'user'");
    const totalCustomers = customersCountRows[0].total_customers;

    // 4. Total Products
    const [productsCountRows] = await db.query('SELECT COUNT(*) as total_products FROM products WHERE is_active = 1');
    const totalProducts = productsCountRows[0].total_products;

    // 5. Low stock alerts (<= 15 items)
    const [lowStockRows] = await db.query(
      'SELECT id, title, sku, stock_quantity, price, image_url FROM products WHERE stock_quantity <= 15 AND is_active = 1 ORDER BY stock_quantity ASC LIMIT 6'
    );

    // 6. Recent Orders
    const [recentOrders] = await db.query(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.payment_status,
        o.payment_method,
        o.shipping_name,
        o.created_at,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 8
    `);

    // 7. Order Status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);

    // 8. Top Selling Categories
    const [categorySales] = await db.query(`
      SELECT 
        c.name as category_name,
        COUNT(oi.id) as units_sold,
        COALESCE(SUM(oi.total_price), 0) as revenue
      FROM categories c
      JOIN products p ON c.id = p.category_id
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockRows.length,
        lowStockProducts: lowStockRows,
        recentOrders,
        statusBreakdown,
        categorySales
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- Product Management ---

// @desc    Add new product
// @route   POST /api/admin/products
// @access  Private (Admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      category_id,
      brand,
      sku,
      price,
      discount_price,
      stock_quantity,
      short_description,
      description,
      image_url,
      additional_images = [],
      specifications = {},
      variants = null,
      is_featured = 0,
      is_active = 1
    } = req.body;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const generatedSku = sku && sku.trim() ? sku.trim().toUpperCase() : `SHO-${Math.floor(100000 + Math.random() * 900000)}`;

    const [result] = await db.query(`
      INSERT INTO products (
        category_id, title, brand, slug, sku, price, discount_price, stock_quantity,
        short_description, description, image_url, additional_images, specifications, variants,
        is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      parseInt(category_id, 10),
      title.trim(),
      brand ? brand.trim() : null,
      slug,
      generatedSku,
      parseFloat(price),
      discount_price ? parseFloat(discount_price) : null,
      parseInt(stock_quantity, 10) || 0,
      short_description ? short_description.trim() : null,
      description ? description.trim() : null,
      image_url.trim(),
      typeof additional_images === 'string' ? additional_images : JSON.stringify(additional_images),
      typeof specifications === 'string' ? specifications : JSON.stringify(specifications),
      typeof variants === 'object' && variants !== null ? JSON.stringify(variants) : (variants || null),
      is_featured ? 1 : 0,
      is_active ? 1 : 0
    ]);

    const [created] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: created[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const {
      title,
      category_id,
      brand,
      sku,
      price,
      discount_price,
      stock_quantity,
      short_description,
      description,
      image_url,
      additional_images,
      specifications,
      variants,
      is_featured,
      is_active
    } = req.body;

    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const finalSku = sku && sku.trim() ? sku.trim().toUpperCase() : existing[0].sku;

    await db.query(`
      UPDATE products SET
        title = ?,
        category_id = ?,
        brand = ?,
        sku = ?,
        price = ?,
        discount_price = ?,
        stock_quantity = ?,
        short_description = ?,
        description = ?,
        image_url = ?,
        additional_images = ?,
        specifications = ?,
        variants = ?,
        is_featured = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title.trim(),
      parseInt(category_id, 10),
      brand !== undefined ? (brand ? brand.trim() : null) : existing[0].brand,
      finalSku,
      parseFloat(price),
      discount_price !== undefined ? (discount_price ? parseFloat(discount_price) : null) : existing[0].discount_price,
      stock_quantity !== undefined ? parseInt(stock_quantity, 10) : existing[0].stock_quantity,
      short_description !== undefined ? (short_description ? short_description.trim() : null) : existing[0].short_description,
      description !== undefined ? (description ? description.trim() : null) : existing[0].description,
      image_url ? image_url.trim() : existing[0].image_url,
      additional_images !== undefined ? (typeof additional_images === 'string' ? additional_images : JSON.stringify(additional_images || [])) : existing[0].additional_images,
      specifications !== undefined ? (typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {})) : existing[0].specifications,
      variants !== undefined ? (typeof variants === 'object' && variants !== null ? JSON.stringify(variants) : (variants || null)) : existing[0].variants,
      is_featured !== undefined ? (is_featured ? 1 : 0) : existing[0].is_featured,
      is_active !== undefined ? (is_active ? 1 : 0) : existing[0].is_active,
      productId
    ]);

    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const [existing] = await db.query('SELECT id, title FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [productId]);

    res.json({
      success: true,
      message: `Product "${existing[0].title}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// --- Category Management ---

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const [result] = await db.query(
      'INSERT INTO categories (name, slug, description, image_url, is_active) VALUES (?, ?, ?, ?, 1)',
      [name.trim(), slug, description || null, image_url || null]
    );

    const [created] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: created[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    const { name, description, image_url, is_active } = req.body;

    const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    await db.query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, is_active = ? WHERE id = ?',
      [name.trim(), slug, description || null, image_url || null, is_active !== undefined ? (is_active ? 1 : 0) : 1, categoryId]
    );

    const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [categoryId]);

    res.json({
      success: true,
      message: 'Category updated successfully.',
      category: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);

    const [existing] = await db.query('SELECT id, name FROM categories WHERE id = ?', [categoryId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if category has products
    const [prods] = await db.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [categoryId]);
    if (prods[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It contains ${prods[0].count} product(s). Please reassign or delete them first.`
      });
    }

    await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);

    res.json({
      success: true,
      message: `Category "${existing[0].name}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// --- Orders Management ---

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 15);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      conditions.push('(o.order_number LIKE ? OR o.shipping_name LIKE ? OR u.email LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await db.query(`
      SELECT COUNT(*) as total 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ${whereClause}
    `, params);
    const total = countRows[0].total;

    const [orders] = await db.query(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limitNum, offset]);

    // Attach item summary to each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        return {
          ...order,
          items
        };
      })
    );

    res.json({
      success: true,
      orders: ordersWithItems,
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

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const [existing] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = existing[0];

    // If changing to cancelled, restore product stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const [items] = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        if (item.product_id) {
          await db.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
      }
    }

    await db.query(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, orderId]
    );

    res.json({
      success: true,
      message: `Order #${order.order_number} status updated to "${status}".`,
      order: {
        ...order,
        status
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- Customers Management ---

// @desc    Get all customers with order statistics
// @route   GET /api/admin/customers
// @access  Private (Admin)
const getAllCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const conditions = ["u.role = 'user'"];
    const params = [];

    if (search && search.trim()) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [customers] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        u.created_at,
        COUNT(o.id) as order_count,
        COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, params);

    res.json({
      success: true,
      customers: customers.map(c => ({
        ...c,
        total_spent: parseFloat(Number(c.total_spent || 0).toFixed(2))
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private (Admin)
const getAllCoupons = async (req, res, next) => {
  try {
    const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({
      success: true,
      coupons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon
// @route   POST /api/admin/coupons
// @access  Private (Admin)
const createCoupon = async (req, res, next) => {
  try {
    const { code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active, expires_at } = req.body;
    if (!code || !code.trim() || !discount_value) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const [existing] = await db.query('SELECT id FROM coupons WHERE code = ?', [cleanCode]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists.` });
    }

    const [result] = await db.query(`
      INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cleanCode,
      description || null,
      discount_type || 'percentage',
      parseFloat(discount_value),
      min_order_amount ? parseFloat(min_order_amount) : 0.00,
      max_discount_amount ? parseFloat(max_discount_amount) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      expires_at || null
    ]);

    const [newCoupon] = await db.query('SELECT * FROM coupons WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      coupon: newCoupon[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private (Admin)
const updateCoupon = async (req, res, next) => {
  try {
    const couponId = parseInt(req.params.id, 10);
    const { code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active, expires_at } = req.body;

    const [existing] = await db.query('SELECT * FROM coupons WHERE id = ?', [couponId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const cleanCode = code ? code.trim().toUpperCase() : existing[0].code;
    await db.query(`
      UPDATE coupons SET
        code = ?,
        description = ?,
        discount_type = ?,
        discount_value = ?,
        min_order_amount = ?,
        max_discount_amount = ?,
        is_active = ?,
        expires_at = ?
      WHERE id = ?
    `, [
      cleanCode,
      description !== undefined ? description : existing[0].description,
      discount_type || existing[0].discount_type,
      discount_value !== undefined ? parseFloat(discount_value) : existing[0].discount_value,
      min_order_amount !== undefined ? parseFloat(min_order_amount) : existing[0].min_order_amount,
      max_discount_amount !== undefined ? (max_discount_amount ? parseFloat(max_discount_amount) : null) : existing[0].max_discount_amount,
      is_active !== undefined ? (is_active ? 1 : 0) : existing[0].is_active,
      expires_at !== undefined ? expires_at : existing[0].expires_at,
      couponId
    ]);

    const [updated] = await db.query('SELECT * FROM coupons WHERE id = ?', [couponId]);
    res.json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon
// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private (Admin)
const deleteCoupon = async (req, res, next) => {
  try {
    const couponId = parseInt(req.params.id, 10);
    const [existing] = await db.query('SELECT id FROM coupons WHERE id = ?', [couponId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    await db.query('DELETE FROM coupons WHERE id = ?', [couponId]);
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for admin moderation
// @route   GET /api/admin/reviews
// @access  Private (Admin)
const getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const [totalRows] = await db.query('SELECT COUNT(*) as count FROM reviews');
    const total = totalRows[0].count;

    const [reviews] = await db.query(`
      SELECT 
        r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at,
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
        p.title as product_title, p.image_url as product_image,
        u.name as user_name, u.email as user_email
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review (admin moderation) and recalculate product rating
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    const [reviewRows] = await db.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    if (reviewRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const review = reviewRows[0];
    const productId = review.product_id;

    await db.query('DELETE FROM reviews WHERE id = ?', [reviewId]);

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

    res.json({
      success: true,
      message: 'Review removed successfully. Product rating recalculated.',
      rating: avgRating,
      num_reviews: totalReviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllReviews,
  deleteReview
};
