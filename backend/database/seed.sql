-- ApexTech Seed Data (MySQL 8.0+)
USE apextech_ecommerce;

-- 1. Seed Users
INSERT INTO users (id, name, email, password, role, phone, avatar_url) VALUES
(1, 'Apex Admin', 'admin@apextech.com', '$2a$10$2IbbqitKQ43m8m7NMNz0leApK0DR/c3fSbt3KhSzErsF5pKaXWQBi', 'admin', '+1 (555) 019-2834', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'),
(2, 'John Doe', 'john@example.com', '$2a$10$ZUFA7Pw0dGuoK/gyoENAg.sEr4cuLIl6td3dD52h4UaMaTtNehCKW', 'user', '+1 (555) 432-8765', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Categories
INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES
(1, 'Laptops & Workstations', 'laptops-workstations', 'High-performance laptops, ultrabooks, and desktop computing powerhouses for creators and engineers.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 1),
(2, 'Smartphones & Tablets', 'smartphones-tablets', 'Next-generation flagship smartphones, folding displays, and high-precision creative tablets.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80', 1),
(3, 'Premium Audio', 'premium-audio', 'Audiophile-grade studio headphones, active noise cancelling, and spatial audio soundbars.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 1),
(4, 'Smart Home & Wearables', 'smart-home-wearables', 'Connected titanium smartwatches, health telemetry, and intelligent ambient home control.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', 1),
(5, 'Gaming Gear', 'gaming-gear', 'Low-latency mechanical keyboards, esports mice, OLED gaming monitors, and consoles.', 'https://images.unsplash.com/photo-1612287233282-36e7a2b9e64e?w=800&auto=format&fit=crop&q=80', 1),
(6, 'Cameras & Studio', 'cameras-studio', 'Mirrorless 8K cinema cameras, prime lenses, and professional studio lighting accessories.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Seed Products
INSERT INTO products (id, category_id, title, slug, sku, price, discount_price, stock_quantity, short_description, description, image_url, additional_images, specifications, is_featured, is_active, rating, num_reviews) VALUES
(
    1, 1, 'MacBook Pro 16" M3 Max Liquid Retina XDR', 'macbook-pro-16-m3-max', 'MBP16-M3M-01',
    3499.00, 3299.00, 24,
    'Uncompromising performance with Apple M3 Max, 36GB Unified Memory, and Liquid Retina XDR Display.',
    'Engineered for extreme pro workflows. The 16-inch MacBook Pro with M3 Max takes power and efficiency to unprecedented heights. Featuring a 16-core CPU, up to 40-core GPU, stunning Extreme Dynamic Range display, and up to 22 hours of battery life.',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"]',
    '{"Processor": "Apple M3 Max (16-Core)", "Memory": "36GB Unified RAM", "Storage": "1TB NVMe SSD", "Display": "16.2-inch Liquid Retina XDR (3456x2234)", "Battery": "Up to 22 Hours", "Weight": "2.16 kg"}',
    1, 1, 4.90, 48
),
(
    2, 1, 'Dell XPS 15 InfinityEdge OLED Laptop', 'dell-xps-15-oled', 'DXPS15-OLED-02',
    2199.00, 1999.00, 18,
    'Sleek CNC aluminum chassis with 3.5K OLED touchscreen and Intel Core i9 processor.',
    'Master your craft with the stunning Dell XPS 15. Equipped with 13th Gen Intel Core i9-13900H, NVIDIA GeForce RTX 4070 GPU, and an immersive 16:10 3.5K OLED touch display with 100% DCI-P3 color gamut.',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"]',
    '{"Processor": "Intel Core i9-13900H", "Graphics": "NVIDIA RTX 4070 8GB GDDR6", "Memory": "32GB DDR5 4800MHz", "Storage": "1TB PCIe Gen4 SSD", "Display": "15.6-inch 3.5K OLED Touch (3456x2160)"}',
    1, 1, 4.80, 32
),
(
    3, 2, 'Apex Titanium Pro 5G Smartphone', 'apex-titanium-pro-5g', 'AT-PRO-5G-03',
    1199.00, 1099.00, 45,
    'Aerospace-grade titanium design with periscope telephoto lens and 120Hz LTPO display.',
    'A masterpiece of modern telecommunication. Built from Grade 5 titanium, featuring a triple camera system with 5x optical zoom, advanced ray-tracing graphics processor, and all-day intelligent battery management.',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80"]',
    '{"Display": "6.7-inch Super AMOLED 120Hz LTPO", "Camera": "48MP Main + 12MP Ultra-wide + 12MP 5x Telephoto", "Chipset": "A17 Bionic 3nm Architecture", "Storage": "256GB NVMe", "Build": "Titanium & Ceramic Shield"}',
    1, 1, 4.95, 87
),
(
    4, 2, 'Pixel Horizon Ultra 256GB Dual SIM', 'pixel-horizon-ultra', 'PH-ULTRA-04',
    899.00, 799.00, 30,
    'Pure computational photography, AI real-time translation, and 24-hour battery reserve.',
    'Engineered for the future with on-device generative AI, incredible night photography capabilities, IP68 water resistance, and guaranteed 7 years of software and security updates.',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"]',
    '{"Display": "6.7-inch QHD+ 120Hz Smooth Display", "Camera": "50MP Octa PD Main + 48MP Quad PD Telephoto", "Processor": "Tensor G3 with Titan M2", "Battery": "5050mAh with 30W Fast Charging"}',
    0, 1, 4.70, 21
),
(
    5, 3, 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', 'sony-wh-1000xm5-wireless', 'SONY-WH5-05',
    399.00, 348.00, 60,
    'Industry-leading active noise cancellation with 8 microphones and LDAC Hi-Res Audio.',
    'Immerse yourself in total silence. Two processors control 8 microphones for unprecedented noise cancellation. Auto NC Optimizer automatically optimizes sound based on wearing conditions and atmospheric pressure.',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"]',
    '{"Driver Unit": "30mm Carbon Fiber Composite", "Battery Life": "Up to 30 Hours with ANC on", "Bluetooth": "Version 5.2 with LDAC / AAC / SBC", "Weight": "250g", "Microphones": "8 Beamforming Microphones"}',
    1, 1, 4.90, 114
),
(
    6, 3, 'Sennheiser Momentum 4 Audiophile Wireless', 'sennheiser-momentum-4', 'SENN-MOM4-06',
    379.00, 299.00, 28,
    'Iconic Sennheiser signature sound with unmatched 60-hour marathon battery life.',
    'Audiophile inspired 42mm transducer system brings brilliant musicality and deep detail. Enjoy adaptive noise cancellation, crystal clear calls, and a lightweight ergonomic fold-flat design.',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"]',
    '{"Battery Life": "60 Hours per single charge", "Transducer": "42mm Dynamic Sound Drivers", "Codecs": "aptX Adaptive, aptX, AAC, SBC", "Fast Charge": "10 min charge for 6 hours playback"}',
    0, 1, 4.75, 38
),
(
    7, 4, 'Apex Watch Ultra 2 Titanium 49mm', 'apex-watch-ultra-2', 'AW-ULTRA2-07',
    799.00, 749.00, 35,
    'Rugged aerospace-grade titanium casing, dual-frequency precision GPS, and 3000 nits display.',
    'The most capable smartwatch ever crafted. Built for endurance athletes, outdoor adventurers, and water sports enthusiasts. Features customized Action Button, siren alarm, depth gauge, and ECG heart telemetry.',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"]',
    '{"Case Size": "49mm Grade 5 Titanium", "Peak Brightness": "3000 nits Always-On Retina", "Water Resistance": "100m ISO standard 22810 & EN13319", "Battery": "Up to 72 Hours in Low Power Mode"}',
    1, 1, 4.92, 59
),
(
    8, 4, 'Aura Smart Home Ambient Hub & Sensor Suite', 'aura-smart-home-hub', 'AURA-HUB-08',
    249.00, 199.00, 50,
    'Unified Matter & Thread smart hub with localized encrypted AI assistant and OLED dial.',
    'Seamlessly unify lighting, climate, security cameras, and media with ultra-low latency local execution. Supports Zigbee, Matter, Thread, and Wi-Fi 6E mesh protocol.',
    'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"]',
    '{"Protocols": "Matter, Thread, Zigbee 3.0, Wi-Fi 6E, Bluetooth 5.3", "Display": "2.4-inch Capacitive OLED Touch Dial", "Security": "Hardware Secure Enclave with AES-256", "Power": "USB-C PD 30W"}',
    0, 1, 4.65, 19
),
(
    9, 5, 'Apex CyberBlade Mechanical Wireless Keyboard', 'apex-cyberblade-keyboard', 'AC-KEY-09',
    189.00, 159.00, 42,
    'Hot-swappable tactile switches, CNC aluminum base, gasket mount, and per-key RGB.',
    'Engineered for competitive gaming and developer productivity. Triple-mode connectivity (2.4GHz low latency, Bluetooth 5.1, and USB-C wired), sound-dampening silicone gaskets, and south-facing RGB LEDs.',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"]',
    '{"Layout": "75% Compact (82 Keys)", "Switches": "Pre-lubed Gateron Pro Yellow Tactile", "Connectivity": "Tri-Mode Wireless 2.4GHz / BT 5.1 / Type-C", "Battery": "4000mAh Rechargeable"}',
    1, 1, 4.88, 64
),
(
    10, 5, 'Viper Pro Wireless Esports Mouse 4000Hz', 'viper-pro-wireless-mouse', 'VIPER-M-10',
    149.00, 129.00, 60,
    'Ultra-lightweight 58g chassis, 30K optical sensor, and true 4000Hz hyper-polling.',
    'Zero dead zone, zero compromises. Trusted by tier-1 esports champions. Delivers up to 90 hours of uninterrupted wireless competitive play with optical switches rated for 90 million clicks.',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=800&auto=format&fit=crop&q=80"]',
    '{"Sensor": "Focus Pro 30K Optical", "Polling Rate": "4000Hz Wireless with HyperPolling Dongle", "Weight": "58 grams", "Battery Life": "90 Hours continuous gameplay"}',
    0, 1, 4.82, 45
),
(
    11, 6, 'Sony Alpha A7 IV Full-Frame Mirrorless 33MP', 'sony-alpha-a7-iv', 'SONY-A7IV-11',
    2498.00, 2298.00, 12,
    'Flagship 33MP Exmor R CMOS sensor, 4K 60p 10-bit 4:2:2 video, and real-time Eye AF.',
    'The hybrid benchmark for creative photography and cinematic videography. Features 5-axis optical in-body image stabilization, side-opening vari-angle LCD touchscreen, and live streaming via USB-C.',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80"]',
    '{"Sensor": "33 Megapixel Full-Frame Exmor R CMOS", "Video": "4K 60p 10-bit 4:2:2 in All-Intra", "Autofocus": "759 phase-detection points with AI tracking", "Stabilization": "5-axis active in-body sensor shift"}',
    1, 1, 4.96, 73
),
(
    12, 6, 'DJI Mavic 3 Pro Cine Quadcopter Drone', 'dji-mavic-3-pro-cine', 'DJI-M3P-12',
    3899.00, 3699.00, 8,
    'Triple camera system with Hasselblad 4/3 CMOS sensor, Apple ProRes, and 43-min flight time.',
    'Unlock next-level aerial cinematography. Equipped with a 24mm Hasselblad lens, a 70mm medium tele camera, and a 166mm tele camera. Supports omnidirectional obstacle sensing and 15km HD video transmission.',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"]',
    '{"Cameras": "Hasselblad 4/3 CMOS (20MP) + 70mm (48MP) + 166mm (12MP)", "Video Recording": "Apple ProRes 422 HQ up to 5.1K 50fps", "Max Flight Time": "43 Minutes", "Transmission": "O3+ up to 15km range"}',
    0, 1, 4.91, 15
)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Seed Addresses
INSERT INTO addresses (id, user_id, full_name, phone, street_address, city, state, postal_code, country, is_default) VALUES
(1, 2, 'John Doe', '+1 (555) 432-8765', '742 Evergreen Terrace', 'Springfield', 'OR', '97477', 'United States', 1)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 5. Seed Sample Orders (for history & dashboard analytics)
INSERT INTO orders (id, order_number, user_id, subtotal, tax_amount, shipping_cost, total_amount, status, payment_method, payment_status, shipping_name, shipping_phone, shipping_street, shipping_city, shipping_state, shipping_postal_code, shipping_country, notes, created_at) VALUES
(1, 'ORD-202610-84920', 2, 3499.00, 279.92, 0.00, 3778.92, 'delivered', 'test_credit_card', 'paid', 'John Doe', '+1 (555) 432-8765', '742 Evergreen Terrace', 'Springfield', 'OR', '97477', 'United States', 'Please leave at front door', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'ORD-202610-91823', 2, 348.00, 27.84, 15.00, 390.84, 'shipped', 'test_credit_card', 'paid', 'John Doe', '+1 (555) 432-8765', '742 Evergreen Terrace', 'Springfield', 'OR', '97477', 'United States', 'Express shipping requested', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 'ORD-202610-10928', 2, 1099.00, 87.92, 0.00, 1186.92, 'processing', 'test_credit_card', 'paid', 'John Doe', '+1 (555) 432-8765', '742 Evergreen Terrace', 'Springfield', 'OR', '97477', 'United States', 'Gift wrap please', DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE order_number=VALUES(order_number);

-- 6. Seed Order Items
INSERT INTO order_items (id, order_id, product_id, product_title, product_image, unit_price, quantity, total_price) VALUES
(1, 1, 1, 'MacBook Pro 16" M3 Max Liquid Retina XDR', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 3499.00, 1, 3499.00),
(2, 2, 5, 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 348.00, 1, 348.00),
(3, 3, 3, 'Apex Titanium Pro 5G Smartphone', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80', 1099.00, 1, 1099.00)
ON DUPLICATE KEY UPDATE product_title=VALUES(product_title);

-- 7. Seed Reviews
INSERT INTO reviews (id, product_id, user_id, rating, comment, created_at) VALUES
(1, 1, 2, 5, 'Unbelievable performance for software compiling and 4K rendering. The display is the best I have ever seen on a notebook.', NOW()),
(2, 5, 2, 5, 'The noise cancellation completely blocks out airplane engine roar and subway noise. Extremely comfortable for all-day wear.', NOW()),
(3, 3, 2, 5, 'The titanium feel in hand is exquisite. Camera quality easily outperforms every other flagship.', NOW())
ON DUPLICATE KEY UPDATE rating=VALUES(rating);
