const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbInstance = null;
let dbEngine = null; // 'mysql' | 'sqlite'

// Helper to seed initial data in both engines
const seedData = {
  users: [
    {
      id: 1,
      name: 'Apex Admin',
      email: 'admin@apextech.com',
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
    }
  ],
  categories: [
    {
      id: 1,
      name: 'Laptops & Workstations',
      slug: 'laptops-workstations',
      description: 'High-performance laptops, ultrabooks, and desktop computing powerhouses for creators and engineers.',
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      is_active: 1
    },
    {
      id: 2,
      name: 'Smartphones & Tablets',
      slug: 'smartphones-tablets',
      description: 'Next-generation flagship smartphones, folding displays, and high-precision creative tablets.',
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      is_active: 1
    },
    {
      id: 3,
      name: 'Premium Audio',
      slug: 'premium-audio',
      description: 'Audiophile-grade studio headphones, active noise cancelling, and spatial audio soundbars.',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      is_active: 1
    },
    {
      id: 4,
      name: 'Smart Home & Wearables',
      slug: 'smart-home-wearables',
      description: 'Connected titanium smartwatches, health telemetry, and intelligent ambient home control.',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      is_active: 1
    },
    {
      id: 5,
      name: 'Gaming Gear',
      slug: 'gaming-gear',
      description: 'Low-latency mechanical keyboards, esports mice, OLED gaming monitors, and consoles.',
      image_url: 'https://images.unsplash.com/photo-1612287233282-36e7a2b9e64e?w=800&auto=format&fit=crop&q=80',
      is_active: 1
    },
    {
      id: 6,
      name: 'Cameras & Studio',
      slug: 'cameras-studio',
      description: 'Mirrorless 8K cinema cameras, prime lenses, and professional studio lighting accessories.',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      is_active: 1
    }
  ],
  products: [
    {
      id: 1,
      category_id: 1,
      title: 'MacBook Pro 16" M3 Max Liquid Retina XDR',
      slug: 'macbook-pro-16-m3-max',
      sku: 'MBP16-M3M-01',
      price: 3499.00,
      discount_price: 3299.00,
      stock_quantity: 24,
      short_description: 'Uncompromising performance with Apple M3 Max, 36GB Unified Memory, and Liquid Retina XDR Display.',
      description: 'Engineered for extreme pro workflows. The 16-inch MacBook Pro with M3 Max takes power and efficiency to unprecedented heights. Featuring a 16-core CPU, up to 40-core GPU, stunning Extreme Dynamic Range display, and up to 22 hours of battery life.',
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
      ]),
      specifications: JSON.stringify({
        Processor: 'Apple M3 Max (16-Core)',
        Memory: '36GB Unified RAM',
        Storage: '1TB NVMe SSD',
        Display: '16.2-inch Liquid Retina XDR (3456x2234)',
        Battery: 'Up to 22 Hours',
        Weight: '2.16 kg'
      }),
      is_featured: 1,
      is_active: 1,
      rating: 4.90,
      num_reviews: 48
    },
    {
      id: 2,
      category_id: 1,
      title: 'Dell XPS 15 InfinityEdge OLED Laptop',
      slug: 'dell-xps-15-oled',
      sku: 'DXPS15-OLED-02',
      price: 2199.00,
      discount_price: 1999.00,
      stock_quantity: 18,
      short_description: 'Sleek CNC aluminum chassis with 3.5K OLED touchscreen and Intel Core i9 processor.',
      description: 'Master your craft with the stunning Dell XPS 15. Equipped with 13th Gen Intel Core i9-13900H, NVIDIA GeForce RTX 4070 GPU, and an immersive 16:10 3.5K OLED touch display with 100% DCI-P3 color gamut.',
      image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
      ]),
      specifications: JSON.stringify({
        Processor: 'Intel Core i9-13900H',
        Graphics: 'NVIDIA RTX 4070 8GB GDDR6',
        Memory: '32GB DDR5 4800MHz',
        Storage: '1TB PCIe Gen4 SSD',
        Display: '15.6-inch 3.5K OLED Touch (3456x2160)'
      }),
      is_featured: 1,
      is_active: 1,
      rating: 4.80,
      num_reviews: 32
    },
    {
      id: 3,
      category_id: 2,
      title: 'Apex Titanium Pro 5G Smartphone',
      slug: 'apex-titanium-pro-5g',
      sku: 'AT-PRO-5G-03',
      price: 1199.00,
      discount_price: 1099.00,
      stock_quantity: 45,
      short_description: 'Aerospace-grade titanium design with periscope telephoto lens and 120Hz LTPO display.',
      description: 'A masterpiece of modern telecommunication. Built from Grade 5 titanium, featuring a triple camera system with 5x optical zoom, advanced ray-tracing graphics processor, and all-day intelligent battery management.',
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
      ]),
      specifications: JSON.stringify({
        Display: '6.7-inch Super AMOLED 120Hz LTPO',
        Camera: '48MP Main + 12MP Ultra-wide + 12MP 5x Telephoto',
        Chipset: 'A17 Bionic 3nm Architecture',
        Storage: '256GB NVMe',
        Build: 'Titanium & Ceramic Shield'
      }),
      is_featured: 1,
      is_active: 1,
      rating: 4.95,
      num_reviews: 87
    },
    {
      id: 4,
      category_id: 2,
      title: 'Pixel Horizon Ultra 256GB Dual SIM',
      slug: 'pixel-horizon-ultra',
      sku: 'PH-ULTRA-04',
      price: 899.00,
      discount_price: 799.00,
      stock_quantity: 30,
      short_description: 'Pure computational photography, AI real-time translation, and 24-hour battery reserve.',
      description: 'Engineered for the future with on-device generative AI, incredible night photography capabilities, IP68 water resistance, and guaranteed 7 years of software and security updates.',
      image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
      ]),
      specifications: JSON.stringify({
        Display: '6.7-inch QHD+ 120Hz Smooth Display',
        Camera: '50MP Octa PD Main + 48MP Quad PD Telephoto',
        Processor: 'Tensor G3 with Titan M2',
        Battery: '5050mAh with 30W Fast Charging'
      }),
      is_featured: 0,
      is_active: 1,
      rating: 4.70,
      num_reviews: 21
    },
    {
      id: 5,
      category_id: 3,
      title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      slug: 'sony-wh-1000xm5-wireless',
      sku: 'SONY-WH5-05',
      price: 399.00,
      discount_price: 348.00,
      stock_quantity: 60,
      short_description: 'Industry-leading active noise cancellation with 8 microphones and LDAC Hi-Res Audio.',
      description: 'Immerse yourself in total silence. Two processors control 8 microphones for unprecedented noise cancellation. Auto NC Optimizer automatically optimizes sound based on wearing conditions and atmospheric pressure.',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
      ]),
      specifications: JSON.stringify({
        'Driver Unit': '30mm Carbon Fiber Composite',
        'Battery Life': 'Up to 30 Hours with ANC on',
        Bluetooth: 'Version 5.2 with LDAC / AAC / SBC',
        Weight: '250g',
        Microphones: '8 Beamforming Microphones'
      }),
      is_featured: 1,
      is_active: 1,
      rating: 4.90,
      num_reviews: 114
    },
    {
      id: 6,
      category_id: 3,
      title: 'Sennheiser Momentum 4 Audiophile Wireless',
      slug: 'sennheiser-momentum-4',
      sku: 'SENN-MOM4-06',
      price: 379.00,
      discount_price: 299.00,
      stock_quantity: 28,
      short_description: 'Iconic Sennheiser signature sound with unmatched 60-hour marathon battery life.',
      description: 'Audiophile inspired 42mm transducer system brings brilliant musicality and deep detail. Enjoy adaptive noise cancellation, crystal clear calls, and a lightweight ergonomic fold-flat design.',
      image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
      ]),
      specifications: JSON.stringify({
        'Battery Life': '60 Hours per single charge',
        Transducer: '42mm Dynamic Sound Drivers',
        Codecs: 'aptX Adaptive, aptX, AAC, SBC',
        'Fast Charge': '10 min charge for 6 hours playback'
      }),
      is_featured: 0,
      is_active: 1,
      rating: 4.75,
      num_reviews: 38
    },
    {
      id: 7,
      category_id: 4,
      title: 'Apex Watch Ultra 2 Titanium 49mm',
      slug: 'apex-watch-ultra-2',
      sku: 'AW-ULTRA2-07',
      price: 799.00,
      discount_price: 749.00,
      stock_quantity: 35,
      short_description: 'Rugged aerospace-grade titanium casing, dual-frequency precision GPS, and 3000 nits display.',
      description: 'The most capable smartwatch ever crafted. Built for endurance athletes, outdoor adventurers, and water sports enthusiasts. Features customized Action Button, siren alarm, depth gauge, and ECG heart telemetry.',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
      ]),
      specifications: JSON.stringify({
        'Case Size': '49mm Grade 5 Titanium',
        'Peak Brightness': '3000 nits Always-On Retina',
        'Water Resistance': '100m ISO standard 22810 & EN13319',
        Battery: 'Up to 72 Hours in Low Power Mode'
      }),
      is_featured: 1,
      is_active: 1,
      rating: 4.92,
      num_reviews: 59
    },
    {
      id: 8,
      category_id: 4,
      title: 'Aura Smart Home Ambient Hub & Sensor Suite',
      slug: 'aura-smart-home-hub',
      sku: 'AURA-HUB-08',
      price: 249.00,
      discount_price: 199.00,
      stock_quantity: 50,
      short_description: 'Unified Matter & Thread smart hub with localized encrypted AI assistant and OLED dial.',
      description: 'Seamlessly unify lighting, climate, security cameras, and media with ultra-low latency local execution. Supports Zigbee, Matter, Thread, and Wi-Fi 6E mesh protocol.',
      image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([]),
      specifications: JSON.stringify({
        Protocols: 'Matter, Thread, Zigbee 3.0, Wi-Fi 6E, Bluetooth 5.3',
        Display: '2.4-inch Capacitive OLED Touch Dial',
        Security: 'Hardware Secure Enclave with AES-256',
        Power: 'USB-C PD 30W'
      }),
      is_featured: 0,
      is_active: 1,
      rating: 4.65,
      num_reviews: 19
    },
    {
      id: 9,
      category_id: 5,
      title: 'Apex CyberBlade Mechanical Wireless Keyboard',
      slug: 'apex-cyberblade-keyboard',
      sku: 'AC-KEY-09',
      price: 189.00,
      discount_price: 159.00,
      stock_quantity: 42,
      short_description: 'Hot-swappable tactile switches, CNC aluminum base, gasket mount, and per-key RGB.',
      description: 'Engineered for competitive gaming and developer productivity. Triple-mode connectivity (2.4GHz low latency, Bluetooth 5.1, and USB-C wired), sound-dampening silicone gaskets, and south-facing RGB LEDs.',
      image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([]),
      specifications: JSON.stringify({
        Layout: '75% Compact (82 Keys)',
        Switches: 'Pre-lubed Gateron Pro Yellow Tactile',
        Connectivity: 'Tri-Mode Wireless 2.4GHz / BT 5.1 / Type-C',
        Battery: '4000mAh Rechargeable'
      }),
      is_featured: 1,
      is_active: 1,
      rating: 4.88,
      num_reviews: 64
    },
    {
      id: 10,
      category_id: 5,
      title: 'Viper Pro Wireless Esports Mouse 4000Hz',
      slug: 'viper-pro-wireless-mouse',
      sku: 'VIPER-M-10',
      price: 149.00,
      discount_price: 129.00,
      stock_quantity: 60,
      short_description: 'Ultra-lightweight 58g chassis, 30K optical sensor, and true 4000Hz hyper-polling.',
      description: 'Zero dead zone, zero compromises. Trusted by tier-1 esports champions. Delivers up to 90 hours of uninterrupted wireless competitive play with optical switches rated for 90 million clicks.',
      image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([]),
      specifications: JSON.stringify({
        Sensor: 'Focus Pro 30K Optical',
        'Polling Rate': '4000Hz Wireless with HyperPolling Dongle',
        Weight: '58 grams',
        'Battery Life': '90 Hours continuous gameplay'
      }),
      is_featured: 0,
      is_active: 1,
      rating: 4.82,
      num_reviews: 45
    },
    {
      id: 11,
      category_id: 6,
      title: 'Sony Alpha A7 IV Full-Frame Mirrorless 33MP',
      slug: 'sony-alpha-a7-iv',
      sku: 'SONY-A7IV-11',
      price: 2498.00,
      discount_price: 2298.00,
      stock_quantity: 12,
      short_description: 'Flagship 33MP Exmor R CMOS sensor, 4K 60p 10-bit 4:2:2 video, and real-time Eye AF.',
      description: 'The hybrid benchmark for creative photography and cinematic videography. Features 5-axis optical in-body image stabilization, side-opening vari-angle LCD touchscreen, and live streaming via USB-C.',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([]),
      specifications: JSON.stringify({
        Sensor: '33 Megapixel Full-Frame Exmor R CMOS',
        Video: '4K 60p 10-bit 4:2:2 in All-Intra',
        Autofocus: '759 phase-detection points with AI tracking',
        Stabilization: '5-axis active in-body sensor shift'
      }),
      is_featured: 1,
      is_active: 1,
      rating: 4.96,
      num_reviews: 73
    },
    {
      id: 12,
      category_id: 6,
      title: 'DJI Mavic 3 Pro Cine Quadcopter Drone',
      slug: 'dji-mavic-3-pro-cine',
      sku: 'DJI-M3P-12',
      price: 3899.00,
      discount_price: 3699.00,
      stock_quantity: 8,
      short_description: 'Triple camera system with Hasselblad 4/3 CMOS sensor, Apple ProRes, and 43-min flight time.',
      description: 'Unlock next-level aerial cinematography. Equipped with a 24mm Hasselblad lens, a 70mm medium tele camera, and a 166mm tele camera. Supports omnidirectional obstacle sensing and 15km HD video transmission.',
      image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
      additional_images: JSON.stringify([]),
      specifications: JSON.stringify({
        Cameras: 'Hasselblad 4/3 CMOS (20MP) + 70mm (48MP) + 166mm (12MP)',
        'Video Recording': 'Apple ProRes 422 HQ up to 5.1K 50fps',
        'Max Flight Time': '43 Minutes',
        Transmission: 'O3+ up to 15km range'
      }),
      is_featured: 0,
      is_active: 1,
      rating: 4.91,
      num_reviews: 15
    }
  ],
  addresses: [
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
  ],
  orders: [
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
  ],
  order_items: [
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
  ],
  reviews: [
    {
      id: 1,
      product_id: 1,
      user_id: 2,
      rating: 5,
      comment: 'Unbelievable performance for software compiling and 4K rendering. The display is the best I have ever seen on a notebook.'
    },
    {
      id: 2,
      product_id: 5,
      user_id: 2,
      rating: 5,
      comment: 'The noise cancellation completely blocks out airplane engine roar and subway noise. Extremely comfortable for all-day wear.'
    },
    {
      id: 3,
      product_id: 3,
      user_id: 2,
      rating: 5,
      comment: 'The titanium feel in hand is exquisite. Camera quality easily outperforms every other flagship.'
    }
  ]
};

// SQLite Wrapper implementing exact mysql2 query/execute signature [rows, fields]
class SQLiteAdapter {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ insertId: this.lastID, affectedRows: this.changes });
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  async query(sql, params = []) {
    // Normalise query: replace backticks or MySQL specific syntax if necessary
    const trimmed = sql.trim();
    const isSelect = /^(SELECT|PRAGMA|EXPLAIN)/i.test(trimmed);

    if (isSelect) {
      const rows = await this.all(sql, params);
      return [rows, []];
    } else {
      const res = await this.run(sql, params);
      return [res, []];
    }
  }

  async execute(sql, params = []) {
    return this.query(sql, params);
  }

  async initSchemaAndSeed() {
    // Create tables in SQLite with identical schema
    await this.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        phone TEXT,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        sku TEXT NOT NULL UNIQUE,
        price REAL NOT NULL,
        discount_price REAL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        short_description TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        additional_images TEXT,
        specifications TEXT,
        is_featured INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        rating REAL NOT NULL DEFAULT 0.00,
        num_reviews INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        street_address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'United States',
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        tax_amount REAL NOT NULL DEFAULT 0.00,
        shipping_cost REAL NOT NULL DEFAULT 0.00,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_method TEXT NOT NULL DEFAULT 'test_credit_card',
        payment_status TEXT NOT NULL DEFAULT 'paid',
        shipping_name TEXT NOT NULL,
        shipping_phone TEXT NOT NULL,
        shipping_street TEXT NOT NULL,
        shipping_city TEXT NOT NULL,
        shipping_state TEXT NOT NULL,
        shipping_postal_code TEXT NOT NULL,
        shipping_country TEXT NOT NULL DEFAULT 'United States',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER,
        product_title TEXT NOT NULL,
        product_image TEXT,
        unit_price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        total_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Check if users already seeded
    const [existingUsers] = await this.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('⚡ [Database] Seeding initial data into database...');

      for (const u of seedData.users) {
        await this.run(
          'INSERT INTO users (id, name, email, password, role, phone, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [u.id, u.name, u.email, u.password, u.role, u.phone, u.avatar_url]
        );
      }

      for (const c of seedData.categories) {
        await this.run(
          'INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [c.id, c.name, c.slug, c.description, c.image_url, c.is_active]
        );
      }

      for (const p of seedData.products) {
        await this.run(
          `INSERT INTO products (id, category_id, title, slug, sku, price, discount_price, stock_quantity, short_description, description, image_url, additional_images, specifications, is_featured, is_active, rating, num_reviews)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id, p.category_id, p.title, p.slug, p.sku, p.price, p.discount_price,
            p.stock_quantity, p.short_description, p.description, p.image_url,
            p.additional_images, p.specifications, p.is_featured, p.is_active,
            p.rating, p.num_reviews
          ]
        );
      }

      for (const a of seedData.addresses) {
        await this.run(
          'INSERT INTO addresses (id, user_id, full_name, phone, street_address, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [a.id, a.user_id, a.full_name, a.phone, a.street_address, a.city, a.state, a.postal_code, a.country, a.is_default]
        );
      }

      for (const o of seedData.orders) {
        await this.run(
          `INSERT INTO orders (id, order_number, user_id, subtotal, tax_amount, shipping_cost, total_amount, status, payment_method, payment_status, shipping_name, shipping_phone, shipping_street, shipping_city, shipping_state, shipping_postal_code, shipping_country, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            o.id, o.order_number, o.user_id, o.subtotal, o.tax_amount, o.shipping_cost,
            o.total_amount, o.status, o.payment_method, o.payment_status,
            o.shipping_name, o.shipping_phone, o.shipping_street, o.shipping_city,
            o.shipping_state, o.shipping_postal_code, o.shipping_country, o.notes
          ]
        );
      }

      for (const oi of seedData.order_items) {
        await this.run(
          'INSERT INTO order_items (id, order_id, product_id, product_title, product_image, unit_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [oi.id, oi.order_id, oi.product_id, oi.product_title, oi.product_image, oi.unit_price, oi.quantity, oi.total_price]
        );
      }

      for (const r of seedData.reviews) {
        await this.run(
          'INSERT INTO reviews (id, product_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
          [r.id, r.product_id, r.user_id, r.rating, r.comment]
        );
      }

      console.log('✅ [Database] Seed data successfully populated!');
    }
  }
}

// MySQL Initializer & Seeder
async function initMySQL(pool) {
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const rawSql = fs.readFileSync(schemaPath, 'utf8');
    // Split by semicolons and execute non-empty statements
    const statements = rawSql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        if (!s) return false;
        const clean = s.replace(/--.*$/gm, '').trim();
        return clean.length > 0 && !clean.toLowerCase().startsWith('create database') && !clean.toLowerCase().startsWith('use ');
      });

    for (const stmt of statements) {
      await pool.query(stmt);
    }
  }

  // Ensure non-destructive schema migrations
  try {
    await pool.query('ALTER TABLE reviews ADD COLUMN is_verified_purchase TINYINT(1) DEFAULT 0');
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE orders ADD COLUMN shipping_tier VARCHAR(30) DEFAULT 'standard'");
  } catch (e) {}

  // Check if users exist in MySQL
  const [existingUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count === 0) {
    console.log('⚡ [MySQL] Seeding initial data into MySQL database...');
    for (const u of seedData.users) {
      await pool.query(
        'INSERT INTO users (id, name, email, password, role, phone, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [u.id, u.name, u.email, u.password, u.role, u.phone, u.avatar_url]
      );
    }
    for (const c of seedData.categories) {
      await pool.query(
        'INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [c.id, c.name, c.slug, c.description, c.image_url, c.is_active]
      );
    }
    for (const p of seedData.products) {
      await pool.query(
        `INSERT INTO products (id, category_id, title, slug, sku, price, discount_price, stock_quantity, short_description, description, image_url, additional_images, specifications, is_featured, is_active, rating, num_reviews)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title)`,
        [
          p.id, p.category_id, p.title, p.slug, p.sku, p.price, p.discount_price,
          p.stock_quantity, p.short_description, p.description, p.image_url,
          p.additional_images, p.specifications, p.is_featured, p.is_active,
          p.rating, p.num_reviews
        ]
      );
    }
    for (const a of seedData.addresses) {
      await pool.query(
        'INSERT INTO addresses (id, user_id, full_name, phone, street_address, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name)',
        [a.id, a.user_id, a.full_name, a.phone, a.street_address, a.city, a.state, a.postal_code, a.country, a.is_default]
      );
    }
    for (const o of seedData.orders) {
      await pool.query(
        `INSERT INTO orders (id, order_number, user_id, subtotal, tax_amount, shipping_cost, total_amount, status, payment_method, payment_status, shipping_name, shipping_phone, shipping_street, shipping_city, shipping_state, shipping_postal_code, shipping_country, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE order_number=VALUES(order_number)`,
        [
          o.id, o.order_number, o.user_id, o.subtotal, o.tax_amount, o.shipping_cost,
          o.total_amount, o.status, o.payment_method, o.payment_status,
          o.shipping_name, o.shipping_phone, o.shipping_street, o.shipping_city,
          o.shipping_state, o.shipping_postal_code, o.shipping_country, o.notes
        ]
      );
    }
    for (const oi of seedData.order_items) {
      await pool.query(
        'INSERT INTO order_items (id, order_id, product_id, product_title, product_image, unit_price, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE product_title=VALUES(product_title)',
        [oi.id, oi.order_id, oi.product_id, oi.product_title, oi.product_image, oi.unit_price, oi.quantity, oi.total_price]
      );
    }
    for (const r of seedData.reviews) {
      await pool.query(
        'INSERT INTO reviews (id, product_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating=VALUES(rating)',
        [r.id, r.product_id, r.user_id, r.rating, r.comment]
      );
    }
    console.log('✅ [MySQL] Initial data seeded successfully!');
  }
}

async function connectDatabase() {
  if (dbInstance) return dbInstance;

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || 'root';
  const dbName = process.env.DB_NAME || 'apextech_ecommerce';

  console.log(`🔍 [Database] Attempting connection to MySQL at ${dbHost}:${dbPort}...`);

  try {
    // 1. First test root connection to ensure database exists
    const rootConnection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      connectTimeout: 2000
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await rootConnection.end();

    // 2. Create MySQL connection pool
    const pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000
    });

    // Test pool connection
    const testConn = await pool.getConnection();
    testConn.release();

    await initMySQL(pool);

    console.log(`✅ [Database] Successfully connected to live MySQL database '${dbName}' on ${dbHost}:${dbPort}`);
    dbEngine = 'mysql';
    dbInstance = pool;
    return pool;
  } catch (mysqlError) {
    const errorDetails = mysqlError.message || mysqlError.code || String(mysqlError);
    console.warn(`⚠️ [Database Notice] MySQL server connection not available (${errorDetails}).`);
    console.log(`🚀 [Database] Seamlessly activating integrated SQL persistent engine (SQLite) with identical schema & seed data.`);

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'ecommerce.db');

    const sqliteAdapter = new SQLiteAdapter(dbPath);
    await sqliteAdapter.initSchemaAndSeed();

    console.log(`✅ [Database] Integrated SQL engine initialized at ${dbPath}`);
    dbEngine = 'sqlite';
    dbInstance = sqliteAdapter;
    return sqliteAdapter;
  }
}

// Proxied query, execute, and transaction methods so controllers can import { query, execute, getConnection, getEngine } directly
const db = {
  query: async (sql, params = []) => {
    const instance = await connectDatabase();
    return instance.query(sql, params);
  },
  execute: async (sql, params = []) => {
    const instance = await connectDatabase();
    return instance.execute(sql, params);
  },
  getConnection: async () => {
    const instance = await connectDatabase();
    if (typeof instance.getConnection === 'function') {
      return instance.getConnection();
    }
    return {
      query: (sql, params) => instance.query(sql, params),
      execute: (sql, params) => instance.execute(sql, params),
      beginTransaction: async () => instance.query('BEGIN'),
      commit: async () => instance.query('COMMIT'),
      rollback: async () => instance.query('ROLLBACK'),
      release: () => {}
    };
  },
  getEngine: () => dbEngine,
  isFallback: () => dbEngine === 'sqlite',
  connect: connectDatabase
};

module.exports = db;
