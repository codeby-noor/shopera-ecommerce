import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { useCurrency } from '../../context/CurrencyContext';
import RatingStars from './RatingStars';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const { formatPrice } = useCurrency();
  const [adding, setAdding] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const inWish = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const hasDiscount = product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.price);
  const currentPrice = hasDiscount ? Number(product.discount_price) : Number(product.price);
  const originalPrice = Number(product.price);
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    setAdding(true);
    await addToCart(product, 1);
    setAdding(false);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleCompareToggle = (e) => {
    e.preventDefault();
    toggleCompare(product);
  };

  return (
    <div className="product-card h-100">
      {/* Top Media Box */}
      <div className="product-img-box position-relative">
        {/* Badges */}
        {hasDiscount && (
          <span className="tag-badge tag-badge-discount">
            -{discountPercent}% OFF
          </span>
        )}
        {!hasDiscount && product.is_featured === 1 && (
          <span className="tag-badge tag-badge-featured">
            Featured
          </span>
        )}

        {/* Wishlist Button */}
        <button
          className={`wishlist-btn-pos ${inWish ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={inWish ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist"
        >
          <i className={`bi ${inWish ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>

        {/* Compare Button */}
        <button
          className={`compare-btn-pos ${inCompare ? 'active' : ''}`}
          onClick={handleCompareToggle}
          title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
          aria-label={inCompare ? 'Remove from comparison' : 'Add to comparison'}
        >
          <i className="bi bi-arrow-left-right"></i>
        </button>

        {/* Product Image Link */}
        <Link to={`/products/${product.slug || product.id}`} className="w-100 h-100 d-block">
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </Link>
      </div>

      {/* Product Information Body */}
      <div className="product-body">
        {/* Category & Stock Warning */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="product-category-sub">
            {product.brand ? `${product.brand} • ` : ''}{product.category_name || 'Marketplace'}
          </span>
          {isLowStock && (
            <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill small" style={{ fontSize: '0.7rem' }}>
              Only {product.stock_quantity} left
            </span>
          )}
          {isOutOfStock && (
            <span className="badge bg-danger-subtle text-danger rounded-pill small" style={{ fontSize: '0.7rem' }}>
              Out of stock
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/products/${product.slug || product.id}`} className="product-title-link">
          {product.title}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <RatingStars rating={product.rating} numReviews={product.num_reviews} />
        </div>

        {/* Price & Action */}
        <div className="product-price-box">
          <div className="d-flex align-items-baseline gap-2 flex-wrap">
            <span className="price-current">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="price-original">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-3">
          <button
            className={`btn w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2 transition-all ${
              addedNotice
                ? 'btn-success text-white'
                : isOutOfStock
                ? 'btn-secondary disabled'
                : 'btn-shopera-primary'
            }`}
            onClick={handleAddToCart}
            disabled={adding || isOutOfStock}
            style={{ minHeight: '44px' }}
          >
            {addedNotice ? (
              <>
                <i className="bi bi-check2-circle fs-5"></i>
                <span>Added<span className="d-none d-sm-inline"> to Cart</span>!</span>
              </>
            ) : adding ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Adding...</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <i className="bi bi-cart-plus fs-5"></i>
                <span>Add<span className="d-none d-sm-inline"> to Cart</span></span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
