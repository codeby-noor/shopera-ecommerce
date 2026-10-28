import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ordersAPI } from '../services/api';

const Cart = () => {
  const { cartItems, cartCount, cartSubtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { formatPrice, currency, currentCurrency } = useCurrency();
  const navigate = useNavigate();

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = sessionStorage.getItem('shopera_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState('');

  // Free shipping threshold: $500
  const freeShippingThreshold = 500;
  const shippingCost = cartSubtotal >= freeShippingThreshold ? 0.00 : (cartCount > 0 ? 15.00 : 0.00);
  const freeShippingDifference = Math.max(0, freeShippingThreshold - cartSubtotal);

  // Recalculate discount if coupon applied
  const discountAmount = appliedCoupon ? Math.min(cartSubtotal, Number(appliedCoupon.discount_amount || 0)) : 0;
  const taxableSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const taxAmount = parseFloat((taxableSubtotal * 0.08).toFixed(2));
  const grandTotal = parseFloat((taxableSubtotal + shippingCost + taxAmount).toFixed(2));

  // If subtotal drops below coupon requirement, alert or revalidate
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.min_order_amount && cartSubtotal < Number(appliedCoupon.min_order_amount)) {
      setCouponError(`Order minimum of $${appliedCoupon.min_order_amount} required for ${appliedCoupon.code}. Coupon removed.`);
      setAppliedCoupon(null);
      sessionStorage.removeItem('shopera_coupon');
    }
  }, [cartSubtotal, appliedCoupon]);

  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await ordersAPI.validateCoupon(code, cartSubtotal);
      if (res.data.success && res.data.coupon) {
        const couponData = {
          code: res.data.coupon.code,
          discount_amount: res.data.coupon.discount_amount,
          discount_type: res.data.coupon.discount_type,
          discount_value: res.data.coupon.discount_value,
          description: res.data.coupon.description,
          min_order_amount: res.data.coupon.min_order_amount
        };
        setAppliedCoupon(couponData);
        sessionStorage.setItem('shopera_coupon', JSON.stringify(couponData));
        setCouponSuccess(`Coupon ${code} applied successfully! You saved $${couponData.discount_amount.toFixed(2)}.`);
        setCouponInput('');
      } else {
        setCouponError(res.data.message || 'Invalid coupon code.');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Failed to apply coupon. Please check the code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem('shopera_coupon');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleClearCart = () => {
    handleRemoveCoupon();
    clearCart();
  };

  if (cartCount === 0) {
    return (
      <div className="container py-5 text-center my-4" style={{ minHeight: '60vh' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5 mx-auto" style={{ maxWidth: '540px' }}>
          <div className="display-1 text-primary opacity-50 mb-3">
            <i className="bi bi-bag-x"></i>
          </div>
          <h2 className="fw-bold mb-2">Your Shopping Bag is Empty</h2>
          <p className="text-secondary mb-4">
            You haven't added any products to your bag yet. Discover daily deals and top marketplace picks across 12 categories.
          </p>
          <div>
            <Link to="/products" className="btn btn-shopera-primary btn-lg rounded-pill px-5">
              Explore Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Title */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="h2 fw-bold mb-1">Shopping Bag</h1>
          <p className="text-muted small mb-0">Review your selected items and configure delivery</p>
        </div>
        <button
          className="btn btn-outline-danger btn-sm rounded-pill"
          onClick={handleClearCart}
        >
          <i className="bi bi-trash me-1"></i>Clear Bag
        </button>
      </div>

      <div className="row g-5">
        {/* Left Column: Cart Items List */}
        <div className="col-lg-8">
          {/* Free Shipping Alert Bar */}
          <div className="card bg-primary-subtle border-0 rounded-4 p-3 mb-4">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-truck text-primary fs-3"></i>
              <div className="flex-grow-1">
                {cartSubtotal >= freeShippingThreshold ? (
                  <span className="fw-bold text-primary">
                    🎉 You've unlocked FREE Worldwide Express Shipping! (Orders {formatPrice(500)}+)
                  </span>
                ) : (
                  <div>
                    <span className="small text-dark fw-semibold d-block">
                      Add <strong>{formatPrice(freeShippingDifference)}</strong> more to unlock <strong>FREE Express Shipping</strong>!
                    </span>
                    <div className="progress mt-2" style={{ height: '6px' }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%` }}
                        aria-valuenow={cartSubtotal}
                        aria-valuemin="0"
                        aria-valuemax={freeShippingThreshold}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Stacked Items View (< md) */}
          <div className="d-block d-md-none mb-4">
            {cartItems.map((item) => {
              const price = item.discount_price && Number(item.discount_price) > 0 ? Number(item.discount_price) : Number(item.price);
              const itemTotal = price * item.quantity;

              return (
                <div key={`mobile-${item.cart_item_id || item.product_id}`} className="cart-mobile-card">
                  {/* Top: Image + Info + Remove */}
                  <div className="d-flex gap-3 align-items-start mb-3">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="cart-mobile-img"
                    />
                    <div className="flex-grow-1 min-w-0">
                      <Link
                        to={`/products/${item.slug || item.product_id}`}
                        className="fw-bold text-dark text-decoration-none d-block text-truncate mb-1"
                        style={{ fontSize: '0.92rem' }}
                      >
                        {item.title}
                      </Link>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <small className="text-muted">{item.category_name || 'Marketplace'}</small>
                        {item.brand && (
                          <span className="badge bg-light text-secondary border small">{item.brand}</span>
                        )}
                      </div>
                      <div className="small text-muted">
                        Unit: <strong className="text-navy">{formatPrice(price)}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px' }}
                      onClick={() => removeFromCart(item.cart_item_id, item.product_id)}
                      title="Remove item"
                      aria-label={`Remove ${item.title} from cart`}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                  {/* Bottom: Quantity Stepper + Item Subtotal */}
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div className="qty-stepper">
                      <button
                        className="qty-stepper-btn"
                        type="button"
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1, item.product_id)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="qty-stepper-val">{item.quantity}</span>
                      <button
                        className="qty-stepper-btn"
                        type="button"
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1, item.product_id)}
                        disabled={item.quantity >= item.stock_quantity}
                        aria-label="Increase quantity"
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>

                    <div className="text-end">
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Subtotal</small>
                      <span className="fw-bold text-primary fs-6">
                        {formatPrice(itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Items Table (>= md) */}
          <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4">Product</th>
                    <th scope="col">Price</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Subtotal</th>
                    <th scope="col" className="pe-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const price = item.discount_price && Number(item.discount_price) > 0 ? Number(item.discount_price) : Number(item.price);
                    const itemTotal = price * item.quantity;

                    return (
                      <tr key={item.cart_item_id || item.product_id}>
                        {/* Product Image & Title */}
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="rounded-3 border"
                              style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                            />
                            <div>
                              <Link
                                to={`/products/${item.slug || item.product_id}`}
                                className="fw-bold text-dark text-decoration-none d-block line-clamp-1"
                                style={{ maxWidth: '280px' }}
                              >
                                {item.title}
                              </Link>
                              <div className="d-flex gap-2 align-items-center">
                                <small className="text-muted">{item.category_name || 'Marketplace'}</small>
                                {item.brand && (
                                  <span className="badge bg-light text-secondary border small">{item.brand}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td>
                          <span className="fw-semibold">
                            {formatPrice(price)}
                          </span>
                        </td>

                        {/* Quantity Stepper */}
                        <td>
                          <div className="qty-stepper">
                            <button
                              className="qty-stepper-btn"
                              type="button"
                              onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1, item.product_id)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="qty-stepper-val">{item.quantity}</span>
                            <button
                              className="qty-stepper-btn"
                              type="button"
                              onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1, item.product_id)}
                              disabled={item.quantity >= item.stock_quantity}
                              aria-label="Increase quantity"
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </td>

                        {/* Item Total */}
                        <td>
                          <span className="fw-bold text-primary">
                            {formatPrice(itemTotal)}
                          </span>
                        </td>

                        {/* Remove Action */}
                        <td className="pe-4 text-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-circle"
                            onClick={() => removeFromCart(item.cart_item_id, item.product_id)}
                            title="Remove item"
                            aria-label={`Remove ${item.title} from cart`}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-ticket-perforated text-primary"></i>
              <span>Promotions & Coupons</span>
            </h5>

            {appliedCoupon ? (
              <div className="p-3 bg-success-subtle border border-success rounded-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <div>
                    <span className="fw-bold text-success me-2">{appliedCoupon.code}</span>
                    <span className="badge bg-success">
                      {appliedCoupon.discount_type === 'percentage'
                        ? `${appliedCoupon.discount_value}% OFF`
                        : `$${appliedCoupon.discount_value} OFF`}
                    </span>
                    <small className="d-block text-secondary">
                      Saved ${Number(appliedCoupon.discount_amount).toFixed(2)} on this order
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm rounded-pill"
                  onClick={handleRemoveCoupon}
                >
                  <i className="bi bi-x-circle me-1"></i>Remove
                </button>
              </div>
            ) : (
              <div>
                <form onSubmit={handleApplyCoupon} className="row g-2 align-items-center">
                  <div className="col-sm-8">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-tag-fill text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 text-uppercase"
                        placeholder="ENTER COUPON CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <button
                      type="submit"
                      className="btn btn-shopera-primary w-100 rounded-pill fw-semibold"
                      disabled={couponLoading || !couponInput.trim()}
                    >
                      {couponLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        'Apply Coupon'
                      )}
                    </button>
                  </div>
                </form>

                {couponError && (
                  <div className="text-danger small mt-2 d-flex align-items-center gap-1">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    <span>{couponError}</span>
                  </div>
                )}
                {couponSuccess && (
                  <div className="text-success small mt-2 d-flex align-items-center gap-1">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{couponSuccess}</span>
                  </div>
                )}

                {/* Available Demo Coupons hint */}
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted d-block mb-1 fw-semibold">
                    <i className="bi bi-stars text-warning me-1"></i>Available Demo Coupons:
                  </small>
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      { code: 'SHOPERA10', text: '10% OFF ($50+)' },
                      { code: 'WELCOME20', text: '$20 OFF ($100+)' },
                      { code: 'MEGA50', text: '$50 OFF ($250+)' },
                      { code: 'SUMMER15', text: '15% OFF ($75+)' }
                    ].map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => {
                          setCouponInput(c.code);
                          setCouponError('');
                        }}
                      >
                        <strong>{c.code}</strong>: {c.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Continue Shopping Link */}
          <div>
            <Link to="/products" className="text-decoration-none fw-semibold text-primary d-inline-flex align-items-center gap-2">
              <i className="bi bi-arrow-left"></i>
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top sticky-top-mobile-disable" style={{ top: '90px' }}>
            <h5 className="fw-bold mb-3 pb-2 border-bottom">Order Summary</h5>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Bag Subtotal ({cartCount} items)</span>
              <span className="fw-semibold">{formatPrice(cartSubtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span className="d-flex align-items-center gap-1">
                  <i className="bi bi-tag-fill"></i>
                  <span>Coupon ({appliedCoupon.code})</span>
                </span>
                <span className="fw-bold">-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Estimated Tax (8%)</span>
              <span className="fw-semibold">{formatPrice(taxAmount)}</span>
            </div>

            <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
              <span className="text-muted">Express Delivery ({formatPrice(500)}+ free)</span>
              <span className={`fw-semibold ${shippingCost === 0 ? 'text-success' : ''}`}>
                {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <div>
                <span className="h5 fw-bold text-dark mb-0 d-block">Total Due</span>
                {currency !== 'USD' && (
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    (${grandTotal.toFixed(2)} USD base)
                  </small>
                )}
              </div>
              <span className="h3 fw-bold text-primary mb-0">{formatPrice(grandTotal)}</span>
            </div>

            <button
              className="btn btn-shopera-primary btn-lg w-100 rounded-pill py-3 fw-bold mb-3"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <i className="bi bi-lock-fill ms-2"></i>
            </button>

            {/* Test Simulation Notice */}
            <div className="text-center">
              <small className="text-muted d-flex align-items-center justify-content-center gap-1">
                <i className="bi bi-shield-check text-success"></i>
                <span>Simulated Secure Sandbox &bull; Verified in MySQL</span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

