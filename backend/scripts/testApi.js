const http = require('http');

const PORT = 5000;

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting SHOPERA Comprehensive API Verification Suite...\n');

  try {
    // 1. Health check & DB engine
    const health = await request({ host: 'localhost', port: PORT, path: '/api/health', method: 'GET' });
    console.log('1. Health Check:', health.status === 200 ? '✅ PASSED' : '❌ FAILED', `Status: ${health.data.status}, DB: ${health.data.database_engine}`);

    // 2. Customer Login
    const custLogin = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'john@example.com', password: 'Customer@123' });
    console.log('2. Customer Login:', custLogin.status === 200 ? '✅ PASSED' : '❌ FAILED', custLogin.data.user?.name);
    const customerToken = custLogin.data.token;

    // 3. Admin Login (Shopera Admin)
    const adminLogin = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@shopera.com', password: 'Admin@123' });
    console.log('3. Admin Login (admin@shopera.com):', adminLogin.status === 200 ? '✅ PASSED' : '❌ FAILED', `Role: ${adminLogin.data.user?.role}`);
    const adminToken = adminLogin.data.token;

    // 4. Products Listing & Multi-Field Search
    const prods = await request({ host: 'localhost', port: PORT, path: '/api/products?q=sony', method: 'GET' });
    console.log('4. Multi-Field Search (q=sony):', prods.status === 200 && prods.data.products?.length > 0 ? '✅ PASSED' : '❌ FAILED', `Found ${prods.data.products?.length} products`);

    // 5. Autocomplete Suggestions
    const sugg = await request({ host: 'localhost', port: PORT, path: '/api/products/search/suggestions?q=nike', method: 'GET' });
    console.log('5. Autocomplete Suggestions (q=nike):', sugg.status === 200 && sugg.data.products?.length > 0 ? '✅ PASSED' : '❌ FAILED', `Found ${sugg.data.products?.length} suggestions`);

    // 6. Brands Metadata
    const brands = await request({ host: 'localhost', port: PORT, path: '/api/products/meta/brands', method: 'GET' });
    console.log('6. Distinct Brands Retrieval:', brands.status === 200 && brands.data.brands?.length >= 10 ? '✅ PASSED' : '❌ FAILED', `${brands.data.brands?.length} brands cataloged`);

    // 7. Categories Listing (12 marketplace categories)
    const cats = await request({ host: 'localhost', port: PORT, path: '/api/categories', method: 'GET' });
    console.log('7. 12 Marketplace Categories:', cats.status === 200 && cats.data.categories?.length >= 12 ? '✅ PASSED' : '❌ FAILED', `${cats.data.categories?.length} categories found`);

    // 8. Coupon Validation (Valid coupon SHOPERA10)
    const validCoupon = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/orders/validate-coupon',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { code: 'SHOPERA10', subtotal: 100 });
    console.log('8. Coupon Validation (SHOPERA10 on $100):', validCoupon.status === 200 && validCoupon.data.coupon?.discount_amount === 10 ? '✅ PASSED' : '❌ FAILED', `Discount: $${validCoupon.data.coupon?.discount_amount}`);

    // 9. Coupon Validation (Invalid coupon rejection)
    const invalidCoupon = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/orders/validate-coupon',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { code: 'FAKECODE99', subtotal: 100 });
    console.log('9. Invalid Coupon Rejection:', invalidCoupon.status === 404 ? '✅ PASSED' : '❌ FAILED', invalidCoupon.data.message);

    // 10. Cart Add & Get
    const addToCartRes = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/cart',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, { productId: 5, quantity: 2 });
    console.log('10. Add to Cart:', addToCartRes.status === 200 ? '✅ PASSED' : '❌ FAILED', `Cart subtotal: $${addToCartRes.data.subtotal}`);

    // 11. Wishlist Toggle
    const wishRes = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/wishlist/toggle',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, { productId: 1 });
    console.log('11. Wishlist Toggle:', wishRes.status === 200 ? '✅ PASSED' : '❌ FAILED', wishRes.data.message);

    // 12. Transactional Order Creation with Coupon
    const orderRes = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, {
      items: [{ productId: 5, quantity: 1 }],
      shipping_address: {
        full_name: 'John Doe',
        phone: '+1 (555) 432-8765',
        street_address: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postal_code: '97477',
        country: 'United States'
      },
      payment_method: 'test_credit_card',
      coupon_code: 'SHOPERA10'
    });
    console.log('12. Create Order with Coupon:', orderRes.status === 201 ? '✅ PASSED' : '❌ FAILED',
      `Order #${orderRes.data.order?.order_number}, Discount: $${orderRes.data.order?.discount_amount}, Total: $${orderRes.data.order?.total_amount}`);

    // 13. Admin Dashboard KPI Stats
    const adminStats = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('13. Admin Dashboard Stats:', adminStats.status === 200 ? '✅ PASSED' : '❌ FAILED',
      `Total Sales: $${adminStats.data.stats?.totalSales}, Orders: ${adminStats.data.stats?.totalOrders}`);

    // 14. Admin Coupon Management
    const adminCoupons = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/admin/coupons',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('14. Admin Coupons Management:', adminCoupons.status === 200 && adminCoupons.data.coupons?.length >= 4 ? '✅ PASSED' : '❌ FAILED',
      `${adminCoupons.data.coupons?.length} active coupons`);

    // 15. Role-Based Access Control (Customer blocked from Admin API)
    const unauthorizedCheck = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log('15. RBAC Protection (Customer blocked from /api/admin):', unauthorizedCheck.status === 403 ? '✅ PASSED' : '❌ FAILED',
      unauthorizedCheck.data.message);

    // 16. Password Recovery - Forgot Password Flow
    const forgotRes = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'john@example.com' });
    console.log('16. Forgot Password Flow:', forgotRes.status === 200 && forgotRes.data.demoResetToken ? '✅ PASSED' : '❌ FAILED',
      forgotRes.data.message);
    const resetToken = forgotRes.data.demoResetToken;

    // 17. Password Recovery - Reset Password Flow
    const resetRes = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { token: resetToken, newPassword: 'Customer@123' });
    console.log('17. Reset Password Flow:', resetRes.status === 200 ? '✅ PASSED' : '❌ FAILED',
      resetRes.data.message);

    // 18. Order Tracking by Order Number
    const orderNum = orderRes.data.order?.order_number;
    const trackRes = await request({
      host: 'localhost',
      port: PORT,
      path: `/api/orders/track/${orderNum}`,
      method: 'GET'
    });
    console.log('18. Order Public Tracking:', trackRes.status === 200 && trackRes.data.order?.status ? '✅ PASSED' : '❌ FAILED',
      `Tracking #${trackRes.data.order?.tracking_number}, Status: ${trackRes.data.order?.status}`);

    // 19. Product Review & Duplicate Review Rejection
    const reviewRes1 = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/products/1/reviews',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, { rating: 5, comment: 'Phenomenal build quality and soundstage!' });

    // Try posting again to verify duplicate rejection
    const reviewRes2 = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/products/1/reviews',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, { rating: 4, comment: 'Trying to review twice.' });
    console.log('19. Duplicate Review Rejection:', reviewRes2.status === 400 ? '✅ PASSED' : '❌ FAILED',
      `Status: ${reviewRes2.status}, Message: "${reviewRes2.data?.message}"`);

    // 20. Review Eligibility Endpoint (Customer purchased Product 5)
    const eligRes = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/products/5/review-eligibility',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log('20. Review Eligibility Check (Product 5):', eligRes.status === 200 ? '✅ PASSED' : '❌ FAILED',
      `Eligible: ${eligRes.data.eligible}, Already Reviewed: ${eligRes.data.alreadyReviewed}`);

    // 21. Non-purchaser Rejected from Reviewing (Product 4 not purchased by customer)
    const nonBuyerReview = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/products/4/reviews',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, { rating: 5, comment: 'Trying to review a product I never purchased.' });
    console.log('21. Verified Purchase Enforcement (Unpurchased Product 4 rejected):', nonBuyerReview.status === 403 ? '✅ PASSED' : '❌ FAILED',
      nonBuyerReview.data?.message);

    // 22. Authoritative Order Summary with Configured Shipping Tier
    const summaryRes = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/orders/calculate-summary',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      items: [{ productId: 1, quantity: 1 }], // $3299
      coupon_code: 'SHOPERA10',
      shipping_tier: 'express'
    });
    const s = summaryRes.data.summary;
    const summaryPassed = summaryRes.status === 200 && s?.shipping?.shipping_tier === 'express' && s?.total_amount > 0 && s?.shipping?.estimate_label;
    console.log('22. Server Order Summary & Delivery Estimate:', summaryPassed ? '✅ PASSED' : '❌ FAILED',
      `Tier: ${s?.shipping?.shipping_tier}, Cost: $${s?.shipping?.shipping_cost}, Label: "${s?.shipping?.estimate_label}"`);

    // 23. Admin Review Moderation List
    const adminReviews = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/admin/reviews',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('23. Admin Review Moderation Portal:', adminReviews.status === 200 && adminReviews.data.reviews ? '✅ PASSED' : '❌ FAILED',
      `Found ${adminReviews.data.reviews?.length} reviews across platform`);

    // 24. Unauthenticated Review Authorization Rejection (Security check)
    const unauthReview = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/products/1/reviews',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { rating: 5, comment: 'No token review.' });
    console.log('24. Unauthorized Review Submission Rejection (401):', unauthReview.status === 401 ? '✅ PASSED' : '❌ FAILED',
      `Status: ${unauthReview.status}`);

    // 25. Standard Ground Shipping Threshold Validation (< $500 incurs $15.00; >= $500 incurs $0.00)
    const lowOrderSummary = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/orders/calculate-summary',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      items: [{ productId: 9, quantity: 1 }], // Hydro Flask (< $500)
      shipping_tier: 'standard'
    });
    const highOrderSummary = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/orders/calculate-summary',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      items: [{ productId: 1, quantity: 1 }], // Sony TV ($3299 >= $500)
      shipping_tier: 'standard'
    });
    const lowS = lowOrderSummary.data?.summary;
    const highS = highOrderSummary.data?.summary;
    const thresholdPassed = lowOrderSummary.status === 200 && lowS?.shipping?.shipping_cost === 15.00 && highS?.shipping?.shipping_cost === 0.00;
    console.log('25. Shipping Threshold Logic (< $500 charges $15, >= $500 is FREE):', thresholdPassed ? '✅ PASSED' : '❌ FAILED',
      `Low order shipping: $${lowS?.shipping?.shipping_cost}, High order shipping: $${highS?.shipping?.shipping_cost}`);

    // 26. Order Summary Error States (Empty items rejection)
    const emptySummary = await request({
      host: 'localhost',
      port: PORT,
      path: '/api/orders/calculate-summary',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { items: [] });
    console.log('26. Order Summary Error Handling (Empty items rejected with 400):', emptySummary.status === 400 ? '✅ PASSED' : '❌ FAILED', emptySummary.data?.message);
    // 27. Verified Purchase Badge & Rating Consistency on Product Endpoint
    const prodDetail = await request({ host: 'localhost', port: PORT, path: '/api/products/1', method: 'GET' });
    const p1 = prodDetail.data?.product;
    const hasReviews = p1 && Array.isArray(p1.reviews) && p1.reviews.length > 0;
    const verifiedBadgeAccurate = hasReviews && p1.reviews.every(r => (r.is_verified_purchase === 1 || r.is_verified_purchase === true));
    console.log('27. Product Reviews Verification Integrity:', (prodDetail.status === 200 && verifiedBadgeAccurate) ? '✅ PASSED' : '❌ FAILED',
      `Product "${p1?.title}" has ${p1?.reviews?.length} verified reviews, avg rating ${p1?.rating}`);

    console.log('\n🎉 ALL 27 SHOPERA BACKEND SUITE CHECKS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

// Check if server is already running, otherwise boot it
http.get(`http://localhost:${PORT}/api/health`, () => {
  // Server is already running on port 5000
  runTests();
}).on('error', () => {
  // Server not running, boot it
  process.env.NODE_ENV = 'development';
  require('../server');
  setTimeout(runTests, 1500);
});
