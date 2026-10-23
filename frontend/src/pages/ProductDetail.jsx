import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import RatingStars from '../components/product/RatingStars';
import ProductCard from '../components/product/ProductCard';
import RecentlyViewed, { recordRecentlyViewed } from '../components/product/RecentlyViewed';

const ProductDetail = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const { isAuthenticated, user } = useAuth();
  const { formatPrice, currency, currentCurrency } = useCurrency();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form & Eligibility state
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews' | 'all'
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Feedback states
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await productsAPI.getProduct(idOrSlug);
        if (res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          setSelectedImage(prod.image_url);
          setQuantity(1);

          // Initialize default variants if product has variants
          if (prod.variants && typeof prod.variants === 'object') {
            const defaults = {};
            Object.keys(prod.variants).forEach(key => {
              if (Array.isArray(prod.variants[key]) && prod.variants[key].length > 0) {
                defaults[key] = prod.variants[key][0];
              }
            });
            setSelectedVariants(defaults);
          } else {
            setSelectedVariants({});
          }

          // Safe browsing history recording
          recordRecentlyViewed(prod);

          // Check review eligibility if user is logged in
          if (isAuthenticated) {
            try {
              const eligRes = await productsAPI.getReviewEligibility(prod.id);
              if (eligRes.data && eligRes.data.success) {
                setReviewEligibility(eligRes.data);
              }
            } catch (eligErr) {
              setReviewEligibility({ eligible: false, message: 'Verified purchase check unavailable.' });
            }
          }

          // Fetch related products
          const relRes = await productsAPI.getRelated(prod.id);
          if (relRes.data.success) {
            setRelated(relRes.data.products);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [idOrSlug, isAuthenticated]);

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary m-auto" role="status">
          <span className="visually-hidden">Loading product...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm border-0 p-5 mx-auto rounded-4 bg-white" style={{ maxWidth: '500px' }}>
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3"></i>
          <h3 className="fw-bold text-navy">Product Not Available</h3>
          <p className="text-secondary">{error || 'This item could not be retrieved from the SHOPERA catalogue.'}</p>
          <div>
            <Link to="/products" className="btn btn-shopera-primary rounded-pill px-4">
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inWish = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const hasDiscount = product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.price);
  const currentPrice = hasDiscount ? Number(product.discount_price) : Number(product.price);
  const originalPrice = Number(product.price);
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const isOutOfStock = product.stock_quantity <= 0;

  // Build image list
  const allImages = [product.image_url, ...(product.additional_images || [])];

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setAddingToCart(true);
    await addToCart(product, quantity);
    setAddingToCart(false);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} on SHOPERA`,
          text: `Check out ${product.title} on SHOPERA - Shop More. Live Better.`,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');
      const res = await productsAPI.addReview(product.id, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data.success) {
        setReviewSuccess('Your review has been verified and posted!');
        setReviewComment('');
        setReviewEligibility({
          eligible: false,
          alreadyReviewed: true,
          message: 'You have already submitted a review for this product.'
        });
        const refreshed = await productsAPI.getProduct(product.id);
        if (refreshed.data.success) {
          setProduct(refreshed.data.product);
        }
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Toast Notification */}
      {shareToast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1080 }}>
          <div className="alert alert-dark border-0 shadow-lg text-white rounded-4 py-2 px-3 d-flex align-items-center gap-2">
            <i className="bi bi-link-45deg fs-5"></i>
            <span>Product link copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products" className="text-secondary text-decoration-none">Marketplace</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/products?category=${product.category_slug}`} className="text-secondary text-decoration-none">
              {product.category_name}
            </Link>
          </li>
          <li className="breadcrumb-item active text-navy fw-semibold text-truncate" aria-current="page" style={{ maxWidth: '300px' }}>
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Main Product Layout */}
      <div className="row g-5">
        {/* Left: Gallery */}
        <div className="col-lg-6">
          <div className="position-relative bg-white border border-light-subtle rounded-4 p-4 text-center mb-3 shadow-sm d-flex align-items-center justify-content-center"
               style={{ minHeight: '440px' }}>
            {hasDiscount && (
              <span className="tag-badge position-absolute top-0 start-0 m-3" style={{ background: 'var(--color-accent-pink)', color: '#fff' }}>
                SAVE {discountPercent}%
              </span>
            )}
            <img
              src={selectedImage}
              alt={product.title}
              className="img-fluid rounded-3 transition-all"
              style={{ maxHeight: '380px', objectFit: 'contain' }}
            />
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="d-flex gap-2 overflow-auto pb-2">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn p-1 border rounded-3 bg-white ${selectedImage === imgUrl ? 'border-primary border-2 shadow-sm' : 'border-light-subtle'}`}
                  style={{ width: '74px', height: '74px', flexShrink: 0 }}
                  onClick={() => setSelectedImage(imgUrl)}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-100 h-100 rounded-2" style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              {product.brand && (
                <span className="badge rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--color-primary)' }}>
                  {product.brand}
                </span>
              )}
              <span className="text-secondary small">&bull; {product.category_name}</span>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 d-flex align-items-center gap-1"
              onClick={handleShare}
              title="Share this product"
            >
              <i className="bi bi-share-fill"></i>
              <span className="small">Share</span>
            </button>
          </div>

          <h1 className="h2 fw-black text-navy mb-2">{product.title}</h1>

          {/* SKU & Rating */}
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3 pb-3 border-bottom">
            <RatingStars rating={product.rating} numReviews={product.num_reviews} />
            <span className="text-secondary opacity-50">&bull;</span>
            <span className="text-secondary small">SKU: <strong className="text-navy">{product.sku}</strong></span>
            <span className="text-secondary opacity-50">&bull;</span>
            <span className={`small fw-bold ${isOutOfStock ? 'text-danger' : 'text-success'}`}>
              <i className={`bi ${isOutOfStock ? 'bi-x-circle-fill' : 'bi-check-circle-fill'} me-1`}></i>
              {isOutOfStock ? 'Out of stock' : `${product.stock_quantity} units available`}
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <div className="d-flex align-items-baseline gap-3">
              <span className="display-6 fw-black text-navy">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-secondary text-decoration-line-through fs-5">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="badge bg-success bg-opacity-10 text-success fs-6 fw-bold">
                    Save {formatPrice(originalPrice - currentPrice)}
                  </span>
                </>
              )}
            </div>
            {currency !== 'USD' && (
              <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-info-circle me-1"></i>
                Converted at benchmark rate (1 USD = {currentCurrency.rate} {currentCurrency.code}). Base price: ${currentPrice.toFixed(2)} USD.
              </small>
            )}
          </div>

          {/* Short Description */}
          <p className="text-secondary mb-4" style={{ lineHeight: 1.7 }}>
            {product.short_description || product.description}
          </p>

          {/* Interactive Variant Selectors */}
          {product.variants && Object.keys(product.variants).length > 0 && (
            <div className="mb-4 p-3 bg-light rounded-4 border">
              {Object.entries(product.variants).map(([variantName, options]) => (
                <div key={variantName} className="mb-3 last-mb-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold text-navy text-uppercase" style={{ letterSpacing: '0.05em' }}>
                      Select {variantName}:
                    </span>
                    <span className="small text-primary fw-semibold">
                      {selectedVariants[variantName] || 'Default'}
                    </span>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {Array.isArray(options) && options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                          selectedVariants[variantName] === opt
                            ? 'btn-shopera-primary shadow-sm'
                            : 'btn-outline-secondary bg-white'
                        }`}
                        onClick={() => setSelectedVariants({ ...selectedVariants, [variantName]: opt })}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Purchase Controls */}
          {/* Purchase Controls */}
          <div className="product-detail-actions d-flex flex-wrap align-items-center gap-2 gap-sm-3 mb-3">
            {/* Quantity Stepper */}
            <div className="qty-stepper">
              <button
                className="qty-stepper-btn"
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                aria-label="Decrease product quantity"
              >
                <i className="bi bi-dash"></i>
              </button>
              <span className="qty-stepper-val">{quantity}</span>
              <button
                className="qty-stepper-btn"
                type="button"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity || isOutOfStock}
                aria-label="Increase product quantity"
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              className={`btn btn-circle-action rounded-circle border d-flex align-items-center justify-content-center ${
                inWish ? 'btn-danger text-white' : 'btn-light text-secondary'
              }`}
              style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', flexShrink: 0 }}
              onClick={() => toggleWishlist(product)}
              title={inWish ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label="Wishlist"
            >
              <i className={`bi ${inWish ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            </button>

            {/* Compare Button */}
            <button
              className={`btn btn-circle-action rounded-circle border d-flex align-items-center justify-content-center ${
                inCompare ? 'btn-primary text-white' : 'btn-light text-secondary'
              }`}
              style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', flexShrink: 0 }}
              onClick={() => toggleCompare(product)}
              title={inCompare ? 'Remove from comparison' : 'Compare with other models'}
              aria-label="Compare Product"
            >
              <i className="bi bi-arrow-left-right"></i>
            </button>

            {/* Add to Cart CTA */}
            <button
              className={`btn btn-lg rounded-pill px-4 fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${
                addedToast ? 'btn-success text-white' : 'btn-shopera-primary'
              }`}
              onClick={handleAddToCart}
              disabled={addingToCart || isOutOfStock}
              style={{ minHeight: '48px' }}
            >
              {addedToast ? (
                <>
                  <i className="bi bi-check2-circle fs-4"></i>
                  <span>Added {quantity} to Bag</span>
                </>
              ) : addingToCart ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Adding...</span>
                </>
              ) : isOutOfStock ? (
                <span>Currently Out of Stock</span>
              ) : (
                <>
                  <i className="bi bi-bag-plus fs-5"></i>
                  <span>Add to Bag &bull; {formatPrice(currentPrice * quantity)}</span>
                </>
              )}
            </button>
          </div>

          {/* Instant Buy Now Button */}
          {!isOutOfStock && (
            <button
              className="btn btn-outline-dark rounded-pill w-100 py-2 fw-bold mb-4 d-flex align-items-center justify-content-center gap-2 text-center"
              onClick={handleBuyNow}
            >
              <i className="bi bi-lightning-fill text-warning"></i>
              <span>Instant Buy Now <span className="d-none d-sm-inline">&bull; Proceed Directly to Checkout</span></span>
            </button>
          )}

          {/* Trust Guarantees & Estimated Delivery */}
          <div className="card bg-light border-0 rounded-4 p-3 mb-4">
            <div className="d-flex flex-column gap-2 text-secondary small">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-truck text-primary fs-6"></i>
                <span>
                  <strong>Delivery Estimate:</strong> 3–5 business days ({currentPrice >= 500 ? 'Free Shipping' : `Standard Ground ${formatPrice(15)}`}). Express Courier option (1–2 days) configured at checkout.
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-success fs-6"></i>
                <span><strong>Verified Genuine:</strong> Official brand warranty with verified serial numbers.</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-arrow-repeat text-info fs-6"></i>
                <span><strong>30-Day Hassle-Free Returns:</strong> Instant prepaid return label on eligible orders.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Customer Reviews */}
      <div className="mt-5 pt-4 border-top">
        <ul className="nav nav-pills mb-4 gap-2 flex-wrap" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link rounded-pill fw-bold px-4 transition-all ${
                activeTab === 'specs' ? 'active bg-primary text-white shadow-sm' : 'text-navy bg-light border'
              }`}
              id="specs-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'specs'}
              onClick={() => setActiveTab('specs')}
            >
              <i className="bi bi-cpu me-2"></i>Product Specifications
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link rounded-pill fw-bold px-4 transition-all ${
                activeTab === 'reviews' ? 'active bg-primary text-white shadow-sm' : 'text-navy bg-light border'
              }`}
              id="reviews-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'reviews'}
              onClick={() => setActiveTab('reviews')}
            >
              <i className="bi bi-star-fill me-2 text-warning"></i>Customer Reviews ({product.reviews?.length || 0})
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link rounded-pill fw-bold px-4 transition-all ${
                activeTab === 'all' ? 'active bg-primary text-white shadow-sm' : 'text-navy bg-light border'
              }`}
              id="all-details-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
            >
              <i className="bi bi-layout-split me-2"></i>All Details
            </button>
          </li>
        </ul>

        <div className="row g-5">
          {/* Specifications Panel */}
          {(activeTab === 'specs' || activeTab === 'all') && (
            <div className={activeTab === 'all' ? 'col-lg-7' : 'col-12 col-lg-10 col-xl-9'}>
              <h5 className="fw-bold text-navy mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-cpu text-primary"></i>
                <span>Key Features & Technical Specs</span>
              </h5>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="table-responsive mb-4">
                  <table className="table table-striped table-bordered rounded-3 overflow-hidden">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <tr key={key}>
                          <th className="bg-light text-secondary fw-semibold w-35" style={{ width: '35%' }}>{key}</th>
                          <td className="text-dark">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-secondary small mb-4">Standard manufacturer specifications apply.</p>
              )}

              <div className="card bg-light border-0 rounded-4 p-4">
                <h5 className="fw-bold text-navy mb-2 d-flex align-items-center gap-2">
                  <i className="bi bi-info-circle text-primary"></i>
                  <span>Detailed Product Overview</span>
                </h5>
                <p className="text-secondary leading-relaxed mb-0" style={{ lineHeight: 1.8 }}>{product.description}</p>
              </div>
            </div>
          )}

          {/* Customer Reviews & Add Review Form Panel */}
          {(activeTab === 'reviews' || activeTab === 'all') && (
            <div className={activeTab === 'all' ? 'col-lg-5' : 'col-12 col-lg-8'}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-navy mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-chat-heart-fill text-primary"></i>
                  <span>Customer Impressions</span>
                </h5>
                <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                  {product.reviews?.length || 0} Total Reviews
                </span>
              </div>

              {/* Past Reviews List */}
              <div className="mb-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="card border-0 shadow-sm p-3 rounded-4 mb-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={rev.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={rev.user_name}
                            className="rounded-circle"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                          <div>
                            <strong className="text-dark small d-block">{rev.user_name}</strong>
                            {rev.is_verified_purchase ? (
                              <span className="badge bg-success bg-opacity-10 text-success small rounded-pill px-2 py-0" style={{ fontSize: '0.68rem' }}>
                                <i className="bi bi-patch-check-fill me-1"></i>Verified Buyer
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <RatingStars rating={rev.rating} showScore={false} />
                      </div>
                      <p className="text-secondary small mb-1">{rev.comment}</p>
                      <small className="text-muted text-end d-block" style={{ fontSize: '0.72rem' }}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="card border-0 bg-light rounded-4 p-4 text-center mb-3">
                    <i className="bi bi-chat-dots text-muted fs-2 mb-2"></i>
                    <p className="text-secondary small mb-0">No customer reviews yet for this model. Be the first to share your feedback!</p>
                  </div>
                )}
              </div>

              {/* Add Review Box */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-light">
                <h6 className="fw-bold text-navy mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-pencil-square text-primary"></i>
                  <span>Leave a Verified Review</span>
                </h6>
                {isAuthenticated ? (
                  reviewEligibility?.alreadyReviewed ? (
                    <div className="alert alert-info border-0 rounded-4 p-3 small d-flex align-items-center gap-2 mb-0">
                      <i className="bi bi-check-circle-fill text-info fs-5 flex-shrink-0"></i>
                      <div>
                        <strong className="d-block text-dark">Review Submitted</strong>
                        <span className="text-secondary">You have already submitted a verified review for this model. Thank you for your feedback!</span>
                      </div>
                    </div>
                  ) : reviewEligibility && !reviewEligibility.eligible ? (
                    <div className="alert alert-warning border-0 rounded-4 p-3 small mb-0">
                      <div className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                        <i className="bi bi-shield-lock-fill text-warning fs-5"></i>
                        <span>Verified Purchase Required</span>
                      </div>
                      <p className="text-secondary mb-0" style={{ lineHeight: 1.5 }}>
                        {reviewEligibility.message || 'Only customers who have ordered and received this product from SHOPERA are eligible to submit reviews.'}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit}>
                      {reviewSuccess && <div className="alert alert-success py-2 small rounded-3">{reviewSuccess}</div>}
                      {reviewError && <div className="alert alert-danger py-2 small rounded-3">{reviewError}</div>}

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-navy">Rating</label>
                        <select
                          className="form-select form-select-sm rounded-3"
                          value={reviewRating}
                          onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
                        >
                          <option value="5">&#9733;&#9733;&#9733;&#9733;&#9733; (5/5 Exceptional)</option>
                          <option value="4">&#9733;&#9733;&#9733;&#9733;&#9734; (4/5 Great)</option>
                          <option value="3">&#9733;&#9733;&#9733;&#9734;&#9734; (3/5 Average)</option>
                          <option value="2">&#9733;&#9733;&#9734;&#9734;&#9734; (2/5 Below Expectations)</option>
                          <option value="1">&#9733;&#9734;&#9734;&#9734;&#9734; (1/5 Poor)</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-navy">Your Review Comment</label>
                        <textarea
                          className="form-control form-control-sm rounded-3"
                          rows="3"
                          placeholder="Share your verified experience, build quality, performance benchmarks..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-shopera-primary btn-sm w-100 rounded-pill fw-bold"
                        disabled={submittingReview || !reviewComment.trim()}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                      </button>
                    </form>
                  )
                ) : (
                  <div className="text-center py-2">
                    <p className="text-secondary small mb-2">Please sign in with your customer account to post a verified review.</p>
                    <Link to="/login" className="btn btn-sm btn-shopera-outline rounded-pill px-4">
                      Sign In to Review
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="mt-5 pt-5 border-top">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase rounded-pill px-3 py-1 small mb-1">
                DISCOVER MORE
              </span>
              <h3 className="fw-black text-navy mb-0">Comparable Marketplace Picks</h3>
            </div>
            <Link to={`/products?category=${product.category_slug}`} className="text-primary fw-semibold small text-decoration-none">
              View Entire Category <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="row g-4">
            {related.map((relProd) => (
              <div key={relProd.id} className="col-lg-3 col-md-6 col-sm-6">
                <ProductCard product={relProd} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      <RecentlyViewed currentProductId={product.id} />
    </div>
  );
};

export default ProductDetail;
