import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { usersAPI, ordersAPI } from '../services/api';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartCount, cartSubtotal, clearCart } = useCart();
  const { formatPrice, currency, currentCurrency, rateMetadata } = useCurrency();
  const navigate = useNavigate();

  // Saved Addresses & Selection
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  // Address Form state
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    save_to_profile: true
  });

  // Inline validation errors
  const [formErrors, setFormErrors] = useState({});

  // Shipping Speed Tier ('standard' | 'express')
  const [shippingTier, setShippingTier] = useState('standard');

  // Server-Calculated Price Summary & Live Verification
  const [serverSummary, setServerSummary] = useState(null);
  const [calculatingSummary, setCalculatingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // Payment method & simulation details
  const [paymentMethod, setPaymentMethod] = useState('test_credit_card');
  const [testCard, setTestCard] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardHolder: '',
    expiry: '12/28',
    cvc: '789'
  });
  const [orderNotes, setOrderNotes] = useState('');

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = sessionStorage.getItem('shopera_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Authoritative server-side calculation call
  const refreshServerSummary = useCallback(async (tier = shippingTier, coupon = appliedCoupon) => {
    if (!cartItems || cartItems.length === 0) return;
    try {
      setCalculatingSummary(true);
      setSummaryError('');
      const payload = {
        items: cartItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity
        })),
        coupon_code: coupon ? coupon.code : null,
        shipping_tier: tier
      };
      const res = await ordersAPI.calculateSummary(payload);
      if (res.data.success && res.data.summary) {
        setServerSummary(res.data.summary);
      }
    } catch (err) {
      console.warn('Live summary calculation note:', err.response?.data?.message || err.message);
      setSummaryError('Pricing calculated from live catalog.');
    } finally {
      setCalculatingSummary(false);
    }
  }, [cartItems, shippingTier, appliedCoupon]);

  // Recalculate summary whenever cart items, shipping tier, or applied coupon changes
  useEffect(() => {
    refreshServerSummary(shippingTier, appliedCoupon);
  }, [shippingTier, appliedCoupon, cartItems, refreshServerSummary]);

  // Handle coupon apply on checkout
  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await ordersAPI.validateCoupon(code, cartSubtotal);
      if (res.data.success && res.data.coupon) {
        const c = {
          code: res.data.coupon.code,
          discount_amount: res.data.coupon.discount_amount,
          discount_type: res.data.coupon.discount_type,
          discount_value: res.data.coupon.discount_value
        };
        setAppliedCoupon(c);
        sessionStorage.setItem('shopera_coupon', JSON.stringify(c));
        setCouponInput('');
        // Trigger server refresh with new coupon
        refreshServerSummary(shippingTier, c);
      } else {
        setCouponError(res.data.message || 'Invalid coupon.');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem('shopera_coupon');
    setCouponError('');
    refreshServerSummary(shippingTier, null);
  };

  // Fetch saved addresses if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const fetchAddresses = async () => {
        try {
          setLoadingAddresses(true);
          const res = await usersAPI.getAddresses();
          if (res.data.success && res.data.addresses.length > 0) {
            setSavedAddresses(res.data.addresses);
            const defaultAddr = res.data.addresses.find(a => a.is_default) || res.data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setAddressForm({
              full_name: defaultAddr.full_name,
              phone: defaultAddr.phone,
              street_address: defaultAddr.street_address,
              city: defaultAddr.city,
              state: defaultAddr.state,
              postal_code: defaultAddr.postal_code,
              country: defaultAddr.country || 'United States',
              save_to_profile: false
            });
          } else {
            // Pre-fill user name and phone
            setAddressForm(prev => ({
              ...prev,
              full_name: user?.name || '',
              phone: user?.phone || ''
            }));
          }
        } catch (err) {
          console.error('Failed to load user addresses:', err);
        } finally {
          setLoadingAddresses(false);
        }
      };

      fetchAddresses();
      setTestCard(prev => ({ ...prev, cardHolder: user?.name || 'Authorized Cardholder' }));
    }
  }, [isAuthenticated, user]);

  if (cartCount === 0) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-bag-x text-muted fs-1 mb-3"></i>
          <h3 className="fw-bold">Your bag is empty</h3>
          <p className="text-muted">Add some products before proceeding to checkout.</p>
          <div>
            <Link to="/products" className="btn btn-shopera-primary">Explore Marketplace</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSavedAddressChange = (addrId) => {
    setSelectedAddressId(addrId);
    setFormErrors({});
    if (addrId === 'new') {
      setAddressForm({
        full_name: user?.name || '',
        phone: user?.phone || '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United States',
        save_to_profile: true
      });
    } else {
      const selected = savedAddresses.find(a => a.id === parseInt(addrId, 10));
      if (selected) {
        setAddressForm({
          full_name: selected.full_name,
          phone: selected.phone,
          street_address: selected.street_address,
          city: selected.city,
          state: selected.state,
          postal_code: selected.postal_code,
          country: selected.country || 'United States',
          save_to_profile: false
        });
      }
    }
  };

  const fillTestDetails = () => {
    setSelectedAddressId('new');
    setAddressForm({
      full_name: user?.name || 'John Doe',
      phone: '+1 (555) 432-8765',
      street_address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      postal_code: '97477',
      country: 'United States',
      save_to_profile: false
    });
    setTestCard({
      cardNumber: '4242 •••• •••• 4242',
      cardHolder: user?.name || 'John Doe',
      expiry: '12/28',
      cvc: '789'
    });
    setFormErrors({});
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!addressForm.full_name || addressForm.full_name.trim().length < 2) {
      errors.full_name = 'Recipient full name is required (at least 2 characters).';
    }
    const cleanPhone = (addressForm.phone || '').replace(/\D/g, '');
    if (!addressForm.phone || cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid phone number (at least 10 digits).';
    }
    if (!addressForm.street_address || addressForm.street_address.trim().length < 5) {
      errors.street_address = 'Please enter a complete street address.';
    }
    if (!addressForm.city || addressForm.city.trim().length === 0) {
      errors.city = 'City is required.';
    }
    if (!addressForm.state || addressForm.state.trim().length === 0) {
      errors.state = 'State / Province is required.';
    }
    const postalRegex = /^[a-zA-Z0-9\s-]{4,10}$/;
    if (!addressForm.postal_code || !postalRegex.test(addressForm.postal_code.trim())) {
      errors.postal_code = 'Please enter a valid ZIP / Postal Code (4-10 characters).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      setErrorMessage('Please correct the highlighted shipping address errors below.');
      return;
    }

    try {
      setSubmittingOrder(true);

      // Optionally save address to user's saved list if new
      if (selectedAddressId === 'new' && addressForm.save_to_profile && isAuthenticated) {
        try {
          await usersAPI.addAddress(addressForm);
        } catch (err) {
          // Non-critical, continue checkout
        }
      }

      // Submit order to backend with validated coupon_code and shipping_tier
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity
        })),
        shipping_address: addressForm,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        shipping_tier: shippingTier,
        notes: orderNotes
      };

      const res = await ordersAPI.createOrder(orderPayload);

      if (res.data.success) {
        sessionStorage.removeItem('shopera_coupon');
        await clearCart();
        navigate(`/order-confirmation/${res.data.order.order_number}`, {
          state: { order: res.data.order }
        });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to place order. Please review your details.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Display totals: prefer server-calculated authoritative breakdown
  const displaySubtotal = serverSummary ? Number(serverSummary.subtotal) : cartSubtotal;
  const displayDiscount = serverSummary ? Number(serverSummary.discount_amount) : (appliedCoupon ? Math.min(cartSubtotal, Number(appliedCoupon.discount_amount || 0)) : 0);
  const displayTax = serverSummary ? Number(serverSummary.tax_amount) : Number(((Math.max(0, cartSubtotal - displayDiscount)) * 0.08).toFixed(2));
  
  // Standard default rules fallback: standard free >= $500 else $15.00; express $15.00 on $500+ else $25.00
  const fallbackShipping = shippingTier === 'express'
    ? (displaySubtotal >= 500 ? 15.00 : 25.00)
    : (displaySubtotal >= 500 ? 0.00 : 15.00);
  const displayShipping = serverSummary ? Number(serverSummary.shipping_cost) : fallbackShipping;
  const displayTotal = serverSummary ? Number(serverSummary.total_amount) : Number((displaySubtotal - displayDiscount + displayTax + displayShipping).toFixed(2));

  const shippingInfo = serverSummary?.shipping_info || {
    tier: shippingTier,
    tier_label: shippingTier === 'express' ? 'Express Priority (1–2 business days)' : 'Standard Ground (3–5 business days)',
    estimate_label: shippingTier === 'express' ? 'Estimated Delivery: 1–2 business days' : 'Estimated Delivery: 3–5 business days',
    estimate_disclaimer: 'Delivery dates are estimated business days and not guaranteed.'
  };

  return (
    <div className="container py-4">
      {/* Title */}
      <div className="mb-4 pb-2 border-bottom">
        <h1 className="h2 fw-bold mb-1">Simulated Checkout</h1>
        <p className="text-muted small mb-0">Secure Portfolio Test Environment &bull; Authoritative Live Pricing &bull; Automated Payment Validation</p>
      </div>

      {/* Test Sandbox Banner */}
      <div className="test-checkout-banner mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="fs-3 text-primary">
            <i className="bi bi-shield-check"></i>
          </div>
          <div>
            <strong className="d-block text-dark">Portfolio Demonstration Mode</strong>
            <small className="text-muted">
              Inventory and prices are authoritatively verified by the server. Simulated payments are automatically approved without charging any bank account.
            </small>
          </div>
        </div>
      </div>

      {/* International Currency & Market Disclosure if non-USD */}
      {currency !== 'USD' && (
        <div className="alert alert-info border-0 shadow-sm rounded-4 mb-4">
          <div className="d-flex align-items-start gap-3">
            <i className="bi bi-globe-americas fs-4 text-primary mt-1"></i>
            <div>
              <strong className="d-block text-dark">International Currency & Settlement Disclosure ({currentCurrency.name})</strong>
              <small className="text-secondary d-block mt-1">
                Display prices are converted using configured benchmark rates (1 USD = {currentCurrency.rate} {currentCurrency.code}) for simulation reference ({rateMetadata.source}).
              </small>
              <small className="text-muted d-block mt-1">
                Notice: Orders are settled in store base currency (<strong>USD</strong>) without hidden live spreads. Local India GST, international customs duties, and cross-border bank charges are not processed by this sandbox environment.
              </small>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger rounded-4 shadow-sm mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="row g-4">
          {/* Left Column: Shipping & Payment */}
          <div className="col-lg-8">
            {/* 1. Shipping Address Section */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <span className="badge rounded-circle" style={{ background: 'var(--color-primary)', color: '#fff', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                  <span>Shipping Address</span>
                </h5>
                {loadingAddresses && <span className="small text-muted"><span className="spinner-border spinner-border-sm me-1"></span>Loading saved addresses...</span>}
              </div>

              {/* Saved addresses selector */}
              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase mb-2">Select Delivery Destination</label>
                  <div className="row g-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div key={addr.id} className="col-md-6">
                          <div
                            className={`checkout-address-card h-100 ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSavedAddressChange(addr.id)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <i className={`bi ${isSelected ? 'bi-check-circle-fill text-primary' : 'bi-circle text-muted'} fs-5`}></i>
                                <strong className="text-dark small">{addr.full_name}</strong>
                              </div>
                              {addr.is_default === 1 && (
                                <span className="badge bg-secondary-subtle text-secondary small" style={{ fontSize: '0.7rem' }}>Default</span>
                              )}
                            </div>
                            <small className="text-muted d-block ps-4">{addr.street_address}</small>
                            <small className="text-muted d-block ps-4">{addr.city}, {addr.state} {addr.postal_code}</small>
                            {addr.phone && <small className="text-secondary d-block ps-4 mt-1"><i className="bi bi-telephone me-1"></i>{addr.phone}</small>}
                          </div>
                        </div>
                      );
                    })}
                    <div className="col-md-6">
                      <div
                        className={`checkout-address-card h-100 d-flex align-items-center justify-content-center text-center ${
                          selectedAddressId === 'new' ? 'selected' : ''
                        }`}
                        onClick={() => handleSavedAddressChange('new')}
                        role="button"
                        tabIndex={0}
                        style={{ minHeight: '100px' }}
                      >
                        <div>
                          <i className={`bi ${selectedAddressId === 'new' ? 'bi-check-circle-fill text-primary' : 'bi-plus-circle text-primary'} fs-4 d-block mb-1`}></i>
                          <span className="small fw-semibold text-primary">Use a Different Address</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Form Inputs */}
              {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                <div className="p-3 bg-light rounded-4 border">
                  <h6 className="fw-bold text-dark small mb-3">
                    <i className="bi bi-geo-alt me-1 text-primary"></i>
                    {savedAddresses.length > 0 ? 'Enter New Delivery Address' : 'Recipient & Delivery Details'}
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Recipient Full Name *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.full_name ? 'is-invalid' : ''}`}
                        placeholder="e.g. John Doe"
                        value={addressForm.full_name}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, full_name: e.target.value });
                          if (formErrors.full_name) setFormErrors({ ...formErrors, full_name: '' });
                        }}
                        required
                      />
                      {formErrors.full_name && <div className="invalid-feedback">{formErrors.full_name}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                        placeholder="e.g. +1 (555) 019-2834"
                        value={addressForm.phone}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, phone: e.target.value });
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                        }}
                        required
                      />
                      {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Street Address *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.street_address ? 'is-invalid' : ''}`}
                        placeholder="House/Apt number, street name, suite"
                        value={addressForm.street_address}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, street_address: e.target.value });
                          if (formErrors.street_address) setFormErrors({ ...formErrors, street_address: '' });
                        }}
                        required
                      />
                      {formErrors.street_address && <div className="invalid-feedback">{formErrors.street_address}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">City *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.city ? 'is-invalid' : ''}`}
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, city: e.target.value });
                          if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                        }}
                        required
                      />
                      {formErrors.city && <div className="invalid-feedback">{formErrors.city}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">State / Province *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.state ? 'is-invalid' : ''}`}
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, state: e.target.value });
                          if (formErrors.state) setFormErrors({ ...formErrors, state: '' });
                        }}
                        required
                      />
                      {formErrors.state && <div className="invalid-feedback">{formErrors.state}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Postal / ZIP Code *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.postal_code ? 'is-invalid' : ''}`}
                        placeholder="ZIP Code"
                        value={addressForm.postal_code}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, postal_code: e.target.value });
                          if (formErrors.postal_code) setFormErrors({ ...formErrors, postal_code: '' });
                        }}
                        required
                      />
                      {formErrors.postal_code && <div className="invalid-feedback">{formErrors.postal_code}</div>}
                    </div>

                    {isAuthenticated && (
                      <div className="col-12">
                        <div className="form-check mt-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="saveAddressCheck"
                            checked={addressForm.save_to_profile}
                            onChange={(e) => setAddressForm({ ...addressForm, save_to_profile: e.target.checked })}
                          />
                          <label className="form-check-label small" htmlFor="saveAddressCheck">
                            Save this address to my profile for future orders
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Shipping Speed & Delivery Information */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <span className="badge rounded-circle" style={{ background: 'var(--color-primary)', color: '#fff', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                <span>Shipping Speed & Delivery Estimates</span>
              </h5>
              <p className="text-muted small mb-3">
                Select your preferred shipping tier. Delivery dates are calculated based on business days and configured fulfillment rules.
              </p>

              <div className="row g-3 mb-3">
                {/* Standard Ground */}
                <div className="col-md-6">
                  <div
                    className={`checkout-option-card h-100 ${shippingTier === 'standard' ? 'selected' : ''}`}
                    onClick={() => setShippingTier('standard')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${shippingTier === 'standard' ? 'bi-check-circle-fill text-primary' : 'bi-circle text-muted'} fs-5`}></i>
                        <div>
                          <strong className="text-dark d-block">Standard Ground</strong>
                          <small className="text-muted">3–5 business days</small>
                        </div>
                      </div>
                      <span className="fw-bold text-dark">
                        {displaySubtotal >= 500 ? (
                          <span className="badge bg-success-subtle text-success">FREE</span>
                        ) : (
                          formatPrice(15)
                        )}
                      </span>
                    </div>
                    <small className="text-muted d-block ps-4">
                      {displaySubtotal >= 500 ? `Qualified for free standard shipping (orders ${formatPrice(500)}+)` : `Free on orders over ${formatPrice(500)}`}
                    </small>
                  </div>
                </div>

                {/* Express Priority */}
                <div className="col-md-6">
                  <div
                    className={`checkout-option-card h-100 ${shippingTier === 'express' ? 'selected' : ''}`}
                    onClick={() => setShippingTier('express')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${shippingTier === 'express' ? 'bi-check-circle-fill text-primary' : 'bi-circle text-muted'} fs-5`}></i>
                        <div>
                          <strong className="text-dark d-block">Express Priority</strong>
                          <small className="text-muted">1–2 business days</small>
                        </div>
                      </div>
                      <span className="fw-bold text-dark">
                        {displaySubtotal >= 500 ? formatPrice(15) : formatPrice(25)}
                      </span>
                    </div>
                    <small className="text-muted d-block ps-4">
                      {displaySubtotal >= 500 ? `Discounted express rate (${formatPrice(15)} on orders ${formatPrice(500)}+)` : `${formatPrice(25)} expedited shipping (orders under ${formatPrice(500)})`}
                    </small>
                  </div>
                </div>
              </div>

              {/* Dynamic Delivery Window Display */}
              <div className="delivery-estimate-box d-flex align-items-start gap-3">
                <i className="bi bi-truck fs-4 text-primary mt-1"></i>
                <div className="flex-grow-1">
                  <strong className="text-dark d-block">
                    {shippingInfo.estimate_label}
                  </strong>
                  <small className="text-muted d-flex align-items-center gap-1 mt-1">
                    <i className="bi bi-info-circle"></i>
                    <span>{shippingInfo.estimate_disclaimer}</span>
                  </small>
                </div>
              </div>
            </div>

            {/* 3. Payment Method Section */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <span className="badge rounded-circle" style={{ background: 'var(--color-primary)', color: '#fff', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                <span>Payment Simulation</span>
              </h5>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div
                    className={`checkout-option-card h-100 ${paymentMethod === 'test_credit_card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('test_credit_card')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${paymentMethod === 'test_credit_card' ? 'bi-check-circle-fill text-primary' : 'bi-circle text-muted'} fs-5`}></i>
                      <div>
                        <strong className="text-dark small d-block">Simulated Credit Card</strong>
                        <small className="text-muted">Visa, Mastercard, Amex</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div
                    className={`checkout-option-card h-100 ${paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${paymentMethod === 'cash_on_delivery' ? 'bi-check-circle-fill text-primary' : 'bi-circle text-muted'} fs-5`}></i>
                      <div>
                        <strong className="text-dark small d-block">Cash On Delivery</strong>
                        <small className="text-muted">Simulated test COD</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'test_credit_card' && (
                <div className="p-3 bg-light rounded-4 border">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Card Number (Sandbox)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={testCard.cardNumber}
                        onChange={(e) => setTestCard({ ...testCard, cardNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={testCard.cardHolder}
                        onChange={(e) => setTestCard({ ...testCard, cardHolder: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3 col-6">
                      <label className="form-label small fw-semibold">Expiry</label>
                      <input
                        type="text"
                        className="form-control"
                        value={testCard.expiry}
                        onChange={(e) => setTestCard({ ...testCard, expiry: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3 col-6">
                      <label className="form-label small fw-semibold">CVC</label>
                      <input
                        type="text"
                        className="form-control"
                        value={testCard.cvc}
                        onChange={(e) => setTestCard({ ...testCard, cvc: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div className="mt-4">
                <label className="form-label small fw-semibold">Delivery Instructions / Notes (Optional)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Leave with building receptionist, ring bell #4..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Server Price Breakdown */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top checkout-sidebar-sticky" style={{ top: '90px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 className="fw-bold mb-0">Order Review</h5>
                {calculatingSummary ? (
                  <span className="spinner-border spinner-border-sm text-primary" role="status" title="Recalculating live totals..."></span>
                ) : (
                  <span className="badge bg-success-subtle text-success small" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-shield-check me-1"></i>Server Verified
                  </span>
                )}
              </div>

              {/* Items List preview */}
              <div className="mb-3 max-vh-40 overflow-auto pe-1" style={{ maxHeight: '220px' }}>
                {cartItems.map(item => {
                  const price = item.discount_price && Number(item.discount_price) > 0 ? Number(item.discount_price) : Number(item.price);
                  return (
                    <div key={item.cart_item_id || item.product_id} className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom border-light">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="rounded-2 border"
                        style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1 text-truncate">
                        <small className="fw-semibold text-dark d-block text-truncate">{item.title}</small>
                        <small className="text-muted">Qty: {item.quantity} &bull; ${price.toFixed(2)}</small>
                      </div>
                      <small className="fw-bold text-dark">${(price * item.quantity).toFixed(2)}</small>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Subtotal</span>
                <span className="fw-semibold">{formatPrice(displaySubtotal)}</span>
              </div>

              {appliedCoupon ? (
                <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                  <span className="small d-flex align-items-center gap-1">
                    <i className="bi bi-tag-fill"></i>
                    <span>Coupon ({appliedCoupon.code})</span>
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-danger p-0 ms-1 text-decoration-none"
                      style={{ fontSize: '0.75rem' }}
                      onClick={handleRemoveCoupon}
                      title="Remove coupon"
                    >
                      (remove)
                    </button>
                  </span>
                  <span className="fw-bold">-{formatPrice(displayDiscount)}</span>
                </div>
              ) : (
                <div className="mb-2">
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{couponError}</div>}
                </div>
              )}

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Estimated Tax (8%)</span>
                <span className="fw-semibold">{formatPrice(displayTax)}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <div>
                  <span className="text-muted small d-block">
                    {shippingTier === 'express' ? 'Express Priority' : 'Standard Ground'}
                  </span>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {shippingTier === 'express' ? '(1–2 business days)' : '(3–5 business days)'}
                  </small>
                </div>
                <span className={`fw-semibold ${displayShipping === 0 ? 'text-success' : 'text-dark'}`}>
                  {displayShipping === 0 ? 'FREE' : formatPrice(displayShipping)}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <div>
                  <span className="h5 fw-bold text-dark mb-0 d-block">Total Due</span>
                  {currency !== 'USD' ? (
                    <small className="text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>
                      Billed as: ${displayTotal.toFixed(2)} USD
                    </small>
                  ) : (
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>Authoritative Server Price</small>
                  )}
                </div>
                <span className="h3 fw-bold text-primary mb-0">{formatPrice(displayTotal)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-shopera-primary btn-lg w-100 rounded-pill py-3 fw-bold"
                disabled={submittingOrder || calculatingSummary}
              >
                {submittingOrder ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    <span>Validating Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Simulated Order</span>
                    <i className="bi bi-arrow-right-circle-fill ms-2"></i>
                  </>
                )}
              </button>

              <div className="text-center mt-3">
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-lock-fill me-1 text-success"></i>
                  256-Bit SSL Encrypted &bull; No Real Charge
                </small>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
