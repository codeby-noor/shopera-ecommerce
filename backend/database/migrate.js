const db = require('../config/db');

async function migrate(existingPool) {
  console.log('🔄 [Migration] Checking and updating database schema...');
  const pool = existingPool || (await db.connect());

  try {
    // 1. Check & Add brand column to products
    const [prodCols] = await pool.query('SHOW COLUMNS FROM products LIKE "brand"');
    if (prodCols.length === 0) {
      console.log('➕ Adding "brand" column to products table...');
      await pool.query('ALTER TABLE products ADD COLUMN brand VARCHAR(100) NULL AFTER category_id');
      await pool.query('ALTER TABLE products ADD INDEX idx_product_brand (brand)');
    }

    // 2. Check & Add variants column to products
    const [varCols] = await pool.query('SHOW COLUMNS FROM products LIKE "variants"');
    if (varCols.length === 0) {
      console.log('➕ Adding "variants" column to products table...');
      await pool.query('ALTER TABLE products ADD COLUMN variants TEXT NULL AFTER specifications');
    }

    // 3. Check & Add coupon_code and discount_amount to orders
    const [couponCols] = await pool.query('SHOW COLUMNS FROM orders LIKE "coupon_code"');
    if (couponCols.length === 0) {
      console.log('➕ Adding "coupon_code" column to orders table...');
      await pool.query('ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) NULL AFTER status');
    }

    const [discountCols] = await pool.query('SHOW COLUMNS FROM orders LIKE "discount_amount"');
    if (discountCols.length === 0) {
      console.log('➕ Adding "discount_amount" column to orders table...');
      await pool.query('ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER coupon_code');
    }

    // 4. Check & Add shipping_tier to orders
    const [shippingCols] = await pool.query('SHOW COLUMNS FROM orders LIKE "shipping_tier"');
    if (shippingCols.length === 0) {
      console.log('➕ Adding "shipping_tier" column to orders table...');
      await pool.query("ALTER TABLE orders ADD COLUMN shipping_tier VARCHAR(30) DEFAULT 'standard'");
    }

    // 5. Check & Add is_verified_purchase to reviews
    const [reviewCols] = await pool.query('SHOW COLUMNS FROM reviews LIKE "is_verified_purchase"');
    if (reviewCols.length === 0) {
      console.log('➕ Adding "is_verified_purchase" column to reviews table...');
      await pool.query('ALTER TABLE reviews ADD COLUMN is_verified_purchase TINYINT(1) DEFAULT 0');
    }

    // 6. Create coupons table
    console.log('➕ Ensuring "coupons" table exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
        discount_value DECIMAL(10, 2) NOT NULL,
        min_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        max_discount_amount DECIMAL(10, 2) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        expires_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_coupon_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ [Migration] Schema migration completed successfully!');
  } catch (err) {
    console.error('❌ [Migration] Error during migration:', err.message);
    throw err;
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = migrate;
