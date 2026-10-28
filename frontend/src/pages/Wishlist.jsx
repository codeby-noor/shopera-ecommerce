import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import RatingStars from '../components/product/RatingStars';

const Wishlist = () => {
  const { wishlistItems, wishlistCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleMoveToCart = async (product) => {
    await addToCart(product, 1);
    await removeFromWishlist(product.id);
  };

  if (wishlistCount === 0) {
    return (
      <div className="container py-5 text-center my-4" style={{ minHeight: '60vh' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <div className="display-1 text-danger opacity-50 mb-3">
            <i className="bi bi-heart"></i>
          </div>
          <h2 className="fw-bold mb-2">Your Wishlist is Empty</h2>
          <p className="text-secondary mb-4">
            Save trending items, gadgets, and daily deals here to easily track price drops and stock.
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
      <div className="mb-4 pb-2 border-bottom">
        <h1 className="h2 fw-bold mb-1">My Wishlist</h1>
        <p className="text-muted small mb-0">You have {wishlistCount} saved item(s)</p>
      </div>

      <div className="row g-2 g-sm-3 g-md-4 product-grid-adaptive">
        {wishlistItems.map((product) => {
          const hasDiscount = product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.price);
          const currentPrice = hasDiscount ? Number(product.discount_price) : Number(product.price);
          const originalPrice = Number(product.price);
          const isOutOfStock = product.stock_quantity <= 0;

          return (
            <div key={product.id} className="col-6 col-md-4 col-lg-3 product-col-adaptive">
              <div className="product-card h-100">
                <div className="product-img-box position-relative">
                  <button
                    className="wishlist-btn-pos active"
                    onClick={() => removeFromWishlist(product.id)}
                    title="Remove from wishlist"
                  >
                    <i className="bi bi-heart-fill"></i>
                  </button>
                  <Link to={`/products/${product.slug || product.id}`} className="w-100 h-100 d-block">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      loading="lazy"
                    />
                  </Link>
                </div>

                <div className="product-body">
                  <span className="product-category-sub">{product.brand ? `${product.brand} • ` : ''}{product.category_name || 'Marketplace'}</span>
                  <Link to={`/products/${product.slug || product.id}`} className="product-title-link">
                    {product.title}
                  </Link>

                  <div className="mb-2">
                    <RatingStars rating={product.rating} numReviews={product.num_reviews} />
                  </div>

                  <div className="product-price-box">
                    <span className="price-current">{formatPrice(currentPrice)}</span>
                    {hasDiscount && <span className="price-original ms-2">{formatPrice(originalPrice)}</span>}
                  </div>

                  <div className="mt-3 d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm rounded-pill flex-grow-1 fw-semibold py-2"
                      onClick={() => handleMoveToCart(product)}
                      disabled={isOutOfStock}
                    >
                      <i className="bi bi-cart-plus me-1"></i>
                      {isOutOfStock ? 'Out of Stock' : 'Move to Bag'}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm rounded-pill px-3"
                      onClick={() => removeFromWishlist(product.id)}
                      title="Remove"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
