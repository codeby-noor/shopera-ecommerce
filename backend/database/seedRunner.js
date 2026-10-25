const db = require('../config/db');
const migrate = require('./migrate');
const seedMarketplace = require('./seedMarketplace');

/**
 * Standalone Seed Runner
 * Run manually via `npm run seed` to populate demo data in a new database.
 * Never runs automatically during normal server boot in production.
 */
async function seedRunner() {
  console.log('🚀 [SeedRunner] Initializing database and starting seed process...');
  const pool = await db.connect();

  // 1. Ensure migrations are applied
  try {
    await migrate(pool);
  } catch (migErr) {
    console.warn('⚠️ [SeedRunner] Migration notice (tables might already be updated):', migErr.message);
  }

  // 2. Seed Default Users (Admin & Customer)
  console.log('👥 [SeedRunner] Seeding default users (admin & customer)...');
  const users = [
    {
      id: 1,
      name: 'Shopera Admin',
      email: 'admin@shopera.com',
      password: '$2a$10$2IbbqitKQ43m8m7NMNz0leApK0DR/c3fSbt3KhSzErsF5pKaXWQBi', // Admin@123
      role: 'admin',
      phone: '+1 (555) 019-2834',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com',
      password: '$2a$10$ZUFA7Pw0dGuoK/gyoENAg.sEr4cuLIl6td3dD52h4UaMaTtNehCKW', // Customer@123
      role: 'user',
      phone: '+1 (555) 432-8765',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Apex Admin',
      email: 'admin@apextech.com',
      password: '$2a$10$2IbbqitKQ43m8m7NMNz0leApK0DR/c3fSbt3KhSzErsF5pKaXWQBi', // Admin@123
      role: 'admin',
      phone: '+1 (555) 019-2834',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    }
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, phone, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password = VALUES(password),
         role = VALUES(role),
         phone = VALUES(phone),
         avatar_url = VALUES(avatar_url)`,
      [u.id, u.name, u.email, u.password, u.role, u.phone, u.avatar_url]
    );
  }
  console.log('✅ Users seeded successfully.');

  // 3. Seed Marketplace Catalog (Categories, Coupons, and Products)
  await seedMarketplace();

  // 4. Seed Addresses
  console.log('📍 [SeedRunner] Seeding sample addresses...');
  const addresses = [
    {
      id: 1,
      user_id: 2,
      full_name: 'John Doe',
      phone: '+1 (555) 432-8765',
      street_address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      postal_code: '97477',
      country: 'United States',
      is_default: 1
    }
  ];

  for (const a of addresses) {
    await pool.query(
      `INSERT INTO addresses (id, user_id, full_name, phone, street_address, city, state, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         phone = VALUES(phone),
         street_address = VALUES(street_address),
         city = VALUES(city),
         state = VALUES(state),
         postal_code = VALUES(postal_code),
         country = VALUES(country),
         is_default = VALUES(is_default)`,
      [a.id, a.user_id, a.full_name, a.phone, a.street_address, a.city, a.state, a.postal_code, a.country, a.is_default]
    );
  }
  console.log('✅ Addresses seeded successfully.');

  // 5. Seed Sample Orders
  console.log('🛒 [SeedRunner] Seeding sample orders...');
  const orders = [
    {
      id: 1,
      order_number: 'ORD-202610-84920',
      user_id: 2,
      subtotal: 3499.00,
      tax_amount: 279.92,
      shipping_cost: 0.00,
      total_amount: 3778.92,
      status: 'delivered',
      payment_method: 'test_credit_card',
      payment_status: 'paid',
      shipping_name: 'John Doe',
      shipping_phone: '+1 (555) 432-8765',
      shipping_street: '742 Evergreen Terrace',
      shipping_city: 'Springfield',
      shipping_state: 'OR',
      shipping_postal_code: '97477',
      shipping_country: 'United States',
      notes: 'Please leave at front door'
    },
    {
      id: 2,
      order_number: 'ORD-202610-91823',
      user_id: 2,
      subtotal: 348.00,
      tax_amount: 27.84,
      shipping_cost: 15.00,
      total_amount: 390.84,
      status: 'shipped',
      payment_method: 'test_credit_card',
      payment_status: 'paid',
      shipping_name: 'John Doe',
      shipping_phone: '+1 (555) 432-8765',
      shipping_street: '742 Evergreen Terrace',
      shipping_city: 'Springfield',
      shipping_state: 'OR',
      shipping_postal_code: '97477',
      shipping_country: 'United States',
      notes: 'Express shipping requested'
    },
    {
      id: 3,
      order_number: 'ORD-202610-10928',
      user_id: 2,
      subtotal: 1099.00,
      tax_amount: 87.92,
      shipping_cost: 0.00,
      total_amount: 1186.92,
      status: 'processing',
      payment_method: 'test_credit_card',
      payment_status: 'paid',
      shipping_name: 'John Doe',
      shipping_phone: '+1 (555) 432-8765',
      shipping_street: '742 Evergreen Terrace',
      shipping_city: 'Springfield',
      shipping_state: 'OR',
      shipping_postal_code: '97477',
      shipping_country: 'United States',
      notes: 'Gift wrap please'
    }
  ];

  for (const o of orders) {
    await pool.query(
      `INSERT INTO orders (
        id, order_number, user_id, subtotal, tax_amount, shipping_cost, total_amount,
        status, payment_method, payment_status, shipping_name, shipping_phone,
        shipping_street, shipping_city, shipping_state, shipping_postal_code,
        shipping_country, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        payment_status = VALUES(payment_status)`,
      [
        o.id, o.order_number, o.user_id, o.subtotal, o.tax_amount, o.shipping_cost,
        o.total_amount, o.status, o.payment_method, o.payment_status,
        o.shipping_name, o.shipping_phone, o.shipping_street, o.shipping_city,
        o.shipping_state, o.shipping_postal_code, o.shipping_country, o.notes
      ]
    );
  }
  console.log('✅ Orders seeded successfully.');

  // 6. Seed Sample Order Items
  console.log('📦 [SeedRunner] Seeding sample order items...');
  const orderItems = [
    {
      id: 1,
      order_id: 1,
      product_id: 1,
      product_title: 'MacBook Pro 16" M3 Max Liquid Retina XDR',
      product_image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      unit_price: 3499.00,
      quantity: 1,
      total_price: 3499.00
    },
    {
      id: 2,
      order_id: 2,
      product_id: 5,
      product_title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      unit_price: 348.00,
      quantity: 1,
      total_price: 348.00
    },
    {
      id: 3,
      order_id: 3,
      product_id: 3,
      product_title: 'Apex Titanium Pro 5G Smartphone',
      product_image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      unit_price: 1099.00,
      quantity: 1,
      total_price: 1099.00
    }
  ];

  for (const oi of orderItems) {
    await pool.query(
      `INSERT INTO order_items (id, order_id, product_id, product_title, product_image, unit_price, quantity, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         product_title = VALUES(product_title),
         unit_price = VALUES(unit_price),
         quantity = VALUES(quantity),
         total_price = VALUES(total_price)`,
      [oi.id, oi.order_id, oi.product_id, oi.product_title, oi.product_image, oi.unit_price, oi.quantity, oi.total_price]
    );
  }
  console.log('✅ Order items seeded successfully.');

  // 7. Seed Sample Reviews
  console.log('⭐ [SeedRunner] Seeding sample reviews...');
  const reviews = [
    {
      id: 1,
      product_id: 1,
      user_id: 2,
      rating: 5,
      comment: 'Unbelievable performance for software compiling and 4K rendering. The display is the best I have ever seen on a notebook.',
      is_verified_purchase: 1
    },
    {
      id: 2,
      product_id: 5,
      user_id: 2,
      rating: 5,
      comment: 'The noise cancellation completely blocks out airplane engine roar and subway noise. Extremely comfortable for all-day wear.',
      is_verified_purchase: 1
    },
    {
      id: 3,
      product_id: 3,
      user_id: 2,
      rating: 5,
      comment: 'The titanium feel in hand is exquisite. Camera quality easily outperforms every other flagship.',
      is_verified_purchase: 1
    }
  ];

  for (const r of reviews) {
    await pool.query(
      `INSERT INTO reviews (id, product_id, user_id, rating, comment, is_verified_purchase)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         rating = VALUES(rating),
         comment = VALUES(comment),
         is_verified_purchase = VALUES(is_verified_purchase)`,
      [r.id, r.product_id, r.user_id, r.rating, r.comment, r.is_verified_purchase]
    );
  }
  console.log('✅ Reviews seeded successfully.');

  console.log('\n🎉 [SeedRunner] Initial database population completed successfully!');
}

if (require.main === module) {
  seedRunner()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ [SeedRunner] Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedRunner;
