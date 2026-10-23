const db = require('../config/db');

// Shipping rules calculation helper
const calculateShippingAndDelivery = (subtotal, shippingTier = 'standard') => {
  const isExpress = shippingTier === 'express';
  let shippingCost = 0.00;
  if (isExpress) {
    shippingCost = subtotal >= 500 ? 15.00 : 25.00;
  } else {
    shippingCost = subtotal >= 500 ? 0.00 : 15.00;
  }

  // Calculate estimated business day transit range
  const minDays = isExpress ? 1 : 3;
  const maxDays = isExpress ? 2 : 5;

  const addBusinessDays = (days) => {
    let cur = new Date();
    let added = 0;
    while (added < days) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // skip Sat (6) and Sun (0)
        added++;
      }
    }
    return cur;
  };

  const minDate = addBusinessDays(minDays);
  const maxDate = addBusinessDays(maxDays);
  const opts = { weekday: 'short', month: 'short', day: 'numeric' };

  return {
    shipping_tier: isExpress ? 'express' : 'standard',
    shipping_name: isExpress ? 'Express Priority Courier (1–2 business days)' : 'Standard Ground Delivery (3–5 business days)',
    shipping_cost: parseFloat(shippingCost.toFixed(2)),
    estimate_label: `Estimated delivery: ${minDate.toLocaleDateString('en-US', opts)} – ${maxDate.toLocaleDateString('en-US', opts)}`,
    estimate_disclaimer: 'Delivery estimates are based on fulfillment schedules and carrier transit estimates; dates are not guaranteed.',
    min_delivery_date: minDate.toISOString(),
    max_delivery_date: maxDate.toISOString()
  };
};

// @desc    Create new order with server-side price & inventory validation
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, shipping_address, payment_method = 'test_credit_card', coupon_code, shipping_tier = 'standard', notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your order must contain at least one product.'
      });
    }

    if (!shipping_address || !shipping_address.street_address || !shipping_address.city) {
      return res.status(400).json({
        success: false,
        message: 'A complete shipping address is required.'
      });
    }

    // 1. Fetch real product prices & stock from database
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const prodId = item.productId || item.product_id;
      const qty = parseInt(item.quantity, 10);

      if (!prodId || isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item parameters in order payload.'
        });
      }

      const [rows] = await db.query(
        'SELECT id, title, price, discount_price, stock_quantity, image_url, is_active FROM products WHERE id = ?',
        [prodId]
      );

      if (rows.length === 0 || rows[0].is_active === 0) {
        return res.status(400).json({
          success: false,
          message: `Item with ID ${prodId} is currently unavailable.`
        });
      }

      const prod = rows[0];

      if (prod.stock_quantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.title}". Only ${prod.stock_quantity} available.`
        });
      }

      const unitPrice = prod.discount_price !== null && prod.discount_price > 0 ? Number(prod.discount_price) : Number(prod.price);
      const itemTotal = parseFloat((unitPrice * qty).toFixed(2));
      subtotal += itemTotal;

      validatedItems.push({
        product_id: prod.id,
        product_title: prod.title,
        product_image: prod.image_url,
        unit_price: unitPrice,
        quantity: qty,
        total_price: itemTotal,
        current_stock: prod.stock_quantity
      });
    }

    // 2. Server-side coupon verification & discount calculation
    let discountAmount = 0.00;
    let appliedCouponCode = null;

    if (coupon_code && String(coupon_code).trim()) {
      const cleanCode = String(coupon_code).trim().toUpperCase();
      const [couponRows] = await db.query(
        'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
        [cleanCode]
      );

      if (couponRows.length > 0) {
        const coupon = couponRows[0];
        const minReq = parseFloat(coupon.min_order_amount || 0);
        const isNotExpired = !coupon.expires_at || new Date(coupon.expires_at) >= new Date();

        if (subtotal >= minReq && isNotExpired) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (subtotal * parseFloat(coupon.discount_value)) / 100;
            if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
              discountAmount = parseFloat(coupon.max_discount_amount);
            }
          } else {
            discountAmount = parseFloat(coupon.discount_value);
          }
          discountAmount = Math.min(subtotal, parseFloat(discountAmount.toFixed(2)));
          appliedCouponCode = cleanCode;
        }
      }
    }

    // 3. Server-side totals calculation using configured shipping rules
    const shippingInfo = calculateShippingAndDelivery(subtotal, shipping_tier);
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = parseFloat((taxableSubtotal * 0.08).toFixed(2)); // 8% sales tax
    const shippingCost = shippingInfo.shipping_cost;
    const totalAmount = parseFloat((subtotal - discountAmount + taxAmount + shippingCost).toFixed(2));

    // 4. Unique order number (e.g. ORD-202610-84729)
    const now = new Date();
    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${datePrefix}-${randomSuffix}`;

    // 5. Transactional Order Placement & Inventory Deduction
    const connection = await db.getConnection();
    let orderId;

    try {
      await connection.beginTransaction();

      const [orderResult] = await connection.query(`
        INSERT INTO orders (
          order_number, user_id, subtotal, tax_amount, shipping_cost, total_amount,
          status, coupon_code, discount_amount, payment_method, payment_status,
          shipping_name, shipping_phone, shipping_street, shipping_city,
          shipping_state, shipping_postal_code, shipping_country, shipping_tier, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderNumber,
        userId,
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
        'processing', // Order accepted and in processing
        appliedCouponCode,
        discountAmount,
        payment_method,
        'paid', // Test simulated payment verified
        shipping_address.full_name || req.user.name,
        shipping_address.phone || req.user.phone || '',
        shipping_address.street_address,
        shipping_address.city,
        shipping_address.state,
        shipping_address.postal_code,
        shipping_address.country || 'United States',
        shippingInfo.shipping_tier,
        notes || null
      ]);

      orderId = orderResult.insertId;

      // Insert Order Items & Deduct Inventory inside transaction
      for (const item of validatedItems) {
        await connection.query(`
          INSERT INTO order_items (
            order_id, product_id, product_title, product_image, unit_price, quantity, total_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          item.product_id,
          item.product_title,
          item.product_image,
          item.unit_price,
          item.quantity,
          item.total_price
        ]);

        // Safely deduct stock
        await connection.query(`
          UPDATE products 
          SET stock_quantity = stock_quantity - ? 
          WHERE id = ?
        `, [item.quantity, item.product_id]);
      }

      // Clear user cart in database
      await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }

    // 6. Fetch full order object with items
    const [orderRows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [itemsRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    const completeOrder = {
      ...orderRows[0],
      items: itemsRows,
      shipping_info: shippingInfo
    };

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Simulated payment completed.',
      order: completeOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order history for authenticated user
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.query(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId]);

    // Attach items to each order
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
      orders: ordersWithItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details by ID or order_number
// @route   GET /api/orders/:idOrNumber
// @access  Private
const getOrderByIdOrNumber = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { idOrNumber } = req.params;
    const isNumeric = !isNaN(idOrNumber);

    const sql = isNumeric
      ? 'SELECT * FROM orders WHERE id = ?'
      : 'SELECT * FROM orders WHERE order_number = ?';

    const [orderRows] = await db.query(sql, [isNumeric ? parseInt(idOrNumber, 10) : idOrNumber]);

    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRows[0];

    // Check authorization: Must be owner or admin
    if (!isAdmin && order.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (restores inventory if order was pending or processing)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const orderId = parseInt(req.params.id, 10);

    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = rows[0];

    if (!isAdmin && order.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already ${order.status}.`
      });
    }

    // Restore inventory and update status inside transaction
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        if (item.product_id) {
          await connection.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
      }

      await connection.query('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['cancelled', orderId]);

      await connection.commit();
    } catch (txErr) {
      await connection.rollback();
      throw txErr;
    } finally {
      connection.release();
    }

    res.json({
      success: true,
      message: 'Order has been cancelled and inventory has been restored.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon code
// @route   POST /api/orders/validate-coupon
// @access  Public / Private
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const [rows] = await db.query(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
      [cleanCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Coupon code "${cleanCode}" is invalid or expired.` });
    }

    const coupon = rows[0];
    const orderSubtotal = parseFloat(subtotal) || 0;
    const minOrder = parseFloat(coupon.min_order_amount || 0);

    if (orderSubtotal < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" requires a minimum order subtotal of $${minOrder.toFixed(2)}.`
      });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" has expired.`
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderSubtotal * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
        discountAmount = parseFloat(coupon.max_discount_amount);
      }
    } else {
      discountAmount = parseFloat(coupon.discount_value);
    }

    discountAmount = Math.min(orderSubtotal, parseFloat(discountAmount.toFixed(2)));

    res.json({
      success: true,
      message: `Coupon "${cleanCode}" applied! You save $${discountAmount.toFixed(2)}.`,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: parseFloat(coupon.discount_value),
        discount_amount: discountAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public order tracking by order number (safe redacted view for guests & tracking portal)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const trackOrderPublic = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    if (!orderNumber || !String(orderNumber).trim()) {
      return res.status(400).json({ success: false, message: 'Order reference number is required.' });
    }

    const cleanOrderNum = String(orderNumber).trim();
    const [orderRows] = await db.query(
      'SELECT id, order_number, status, payment_status, total_amount, discount_amount, coupon_code, shipping_name, shipping_city, shipping_country, created_at FROM orders WHERE order_number = ?',
      [cleanOrderNum]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, message: `No active order found with reference "${cleanOrderNum}".` });
    }

    const order = orderRows[0];
    const [items] = await db.query(
      'SELECT product_title, product_image, quantity, unit_price, total_price FROM order_items WHERE order_id = ?',
      [order.id]
    );
    order.items = items;
    order.tracking_number = `SHP-TRK-${order.order_number.replace('ORD-', '')}`;
    const orderDate = new Date(order.created_at);
    order.estimated_delivery = new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate authoritative order summary with real prices, coupon, and shipping
// @route   POST /api/orders/calculate-summary
// @access  Public / Private
const calculateOrderSummary = async (req, res, next) => {
  try {
    const { items, coupon_code, shipping_tier = 'standard' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided for summary calculation.'
      });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.productId || item.product_id;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      const [rows] = await db.query(
        'SELECT id, title, price, discount_price, stock_quantity, image_url, is_active FROM products WHERE id = ?',
        [prodId]
      );

      if (rows.length > 0 && rows[0].is_active === 1) {
        const prod = rows[0];
        const unitPrice = prod.discount_price && parseFloat(prod.discount_price) > 0
          ? parseFloat(prod.discount_price)
          : parseFloat(prod.price);
        const itemTotal = parseFloat((unitPrice * qty).toFixed(2));
        subtotal += itemTotal;
        validatedItems.push({
          product_id: prod.id,
          title: prod.title,
          image_url: prod.image_url,
          unit_price: unitPrice,
          quantity: qty,
          total_price: itemTotal,
          in_stock: prod.stock_quantity >= qty,
          available_stock: prod.stock_quantity
        });
      }
    }

    subtotal = parseFloat(subtotal.toFixed(2));

    // Validate Coupon
    let discountAmount = 0;
    let appliedCoupon = null;

    if (coupon_code && String(coupon_code).trim()) {
      const cleanCode = String(coupon_code).trim().toUpperCase();
      const [couponRows] = await db.query(
        'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
        [cleanCode]
      );

      if (couponRows.length > 0) {
        const c = couponRows[0];
        const minReq = parseFloat(c.min_order_amount || 0);
        const notExpired = !c.expires_at || new Date(c.expires_at) >= new Date();

        if (subtotal >= minReq && notExpired) {
          if (c.discount_type === 'percentage') {
            discountAmount = (subtotal * parseFloat(c.discount_value)) / 100;
            if (c.max_discount_amount && discountAmount > parseFloat(c.max_discount_amount)) {
              discountAmount = parseFloat(c.max_discount_amount);
            }
          } else {
            discountAmount = parseFloat(c.discount_value);
          }
          discountAmount = Math.min(subtotal, parseFloat(discountAmount.toFixed(2)));
          appliedCoupon = {
            code: cleanCode,
            discount_amount: discountAmount,
            discount_type: c.discount_type
          };
        }
      }
    }

    // Shipping calculations using configured rules
    const shippingInfo = calculateShippingAndDelivery(subtotal, shipping_tier);
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = parseFloat((taxableSubtotal * 0.08).toFixed(2));
    const totalAmount = parseFloat((taxableSubtotal + taxAmount + shippingInfo.shipping_cost).toFixed(2));

    res.json({
      success: true,
      summary: {
        items_count: validatedItems.length,
        items: validatedItems,
        subtotal,
        discount_amount: discountAmount,
        applied_coupon: appliedCoupon,
        tax_amount: taxAmount,
        shipping: shippingInfo,
        shipping_info: shippingInfo,
        shipping_cost: shippingInfo.shipping_cost,
        total_amount: totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderByIdOrNumber,
  cancelOrder,
  validateCoupon,
  trackOrderPublic,
  calculateOrderSummary,
  calculateShippingAndDelivery
};
