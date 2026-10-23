import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import RatingStars from '../components/product/RatingStars';

const Compare = () => {
  const { compareItems, removeFromCompare, clearCompare, maxItems } = useCompare();
  const { addToCart } = useCart();
  const { formatPrice, currency, currentCurrency } = useCurrency();

  // Extract all unique specification keys across all products in compare
  const allSpecKeys = React.useMemo(() => {
    const keysSet = new Set();
    compareItems.forEach(item => {
      if (item.specifications && typeof item.specifications === 'object') {
        Object.keys(item.specifications).forEach(k => keysSet.add(k));
      }
    });
    return Array.from(keysSet);
  }, [compareItems]);

  if (compareItems.length === 0) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '65vh' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5 mx-auto bg-white" style={{ maxWidth: '620px' }}>
          <div className="mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
            <div className="w-100 h-100 rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fs-1">
              <i className="bi bi-arrow-left-right"></i>
            </div>
          </div>
          <h2 className="fw-black text-navy mb-2">No Products in Comparison</h2>
          <p className="text-secondary mb-4 leading-relaxed">
            You can compare up to {maxItems} products side-by-side to review technical specifications, pricing, ratings, and stock availability before purchasing.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/products" className="btn btn-shopera-primary rounded-pill px-4 fw-bold">
              <i className="bi bi-grid-fill me-2"></i>Browse Products
            </Link>
            <Link to="/" className="btn btn-shopera-outline rounded-pill px-4">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page py-5">
      <div className="container">
        {/* Breadcrumb & Header */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/products" className="text-secondary text-decoration-none">Catalogue</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Product Comparison</li>
          </ol>
        </nav>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary bg-opacity-10 text-primary fw-bold rounded-pill px-3 py-1">
                SIDE-BY-SIDE MATRIX
              </span>
              <span className="text-muted small">&bull; {compareItems.length} of {maxItems} slots utilized</span>
            </div>
            <h1 className="h2 fw-black text-navy mb-0">Product Comparison</h1>
          </div>
          <div className="d-flex align-items-center gap-2">
            {compareItems.length < maxItems && (
              <Link to="/products" className="btn btn-sm btn-shopera-outline rounded-pill px-3">
                <i className="bi bi-plus-lg me-1"></i>Add Another Model
              </Link>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger rounded-pill px-3"
              onClick={clearCompare}
              title="Clear all compared items"
            >
              <i className="bi bi-trash3 me-1"></i>Clear All
            </button>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-5">
          <div className="table-responsive">
            <table className="table table-bordered mb-0 align-middle compare-table">
              <thead>
                <tr className="bg-light">
                  <th className="p-3 text-secondary small fw-bold text-uppercase" style={{ minWidth: '180px', width: '20%' }}>
                    Product Details
                  </th>
                  {compareItems.map(item => {
                    const price = Number(item.price);
                    const discountPrice = item.discount_price ? Number(item.discount_price) : null;
                    const finalPrice = discountPrice || price;
                    const isOutOfStock = item.stock_quantity <= 0;

                    return (
                      <th key={item.id} className="p-3 text-center align-top position-relative" style={{ minWidth: '240px', width: `${80 / compareItems.length}%` }}>
                        <button
                          type="button"
                          className="btn-close position-absolute top-0 end-0 m-3 shadow-none"
                          aria-label={`Remove ${item.title} from compare`}
                          onClick={() => removeFromCompare(item.id)}
                          title="Remove from comparison"
                        ></button>

                        <div className="mb-3 text-center">
                          <Link to={`/products/${item.slug || item.id}`}>
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="img-fluid rounded-3 border p-1 bg-white hover-zoom"
                              style={{ width: '140px', height: '140px', objectFit: 'contain' }}
                            />
                          </Link>
                        </div>

                        <span className="badge bg-secondary bg-opacity-10 text-secondary small rounded-pill mb-1">
                          {item.category_name || 'Marketplace'}
                        </span>

                        <h6 className="fw-bold text-navy mb-2 line-clamp-2" style={{ minHeight: '2.5rem' }}>
                          <Link to={`/products/${item.slug || item.id}`} className="text-dark text-decoration-none text-hover-primary">
                            {item.title}
                          </Link>
                        </h6>

                        {/* Pricing */}
                        <div className="mb-2">
                          <span className="h5 fw-bold text-primary mb-0">{formatPrice(finalPrice)}</span>
                          {discountPrice && (
                            <span className="text-muted text-decoration-line-through small ms-2">{formatPrice(price)}</span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="mb-3 d-flex justify-content-center">
                          <RatingStars rating={item.rating || 0} reviewsCount={item.num_reviews || 0} />
                        </div>

                        {/* Availability */}
                        <div className="mb-3">
                          {isOutOfStock ? (
                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-1">Out of Stock</span>
                          ) : (
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">
                              In Stock ({item.stock_quantity} left)
                            </span>
                          )}
                        </div>

                        {/* Action CTA */}
                        <div>
                          <button
                            type="button"
                            className="btn btn-shopera-primary btn-sm w-100 rounded-pill fw-bold"
                            disabled={isOutOfStock}
                            onClick={() => addToCart(item, 1)}
                          >
                            <i className="bi bi-cart-plus me-1"></i>Add to Cart
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {/* Brand & Reference */}
                <tr>
                  <th className="bg-light text-secondary small fw-bold">Brand & SKU</th>
                  {compareItems.map(item => (
                    <td key={item.id} className="text-center">
                      <div className="fw-semibold text-dark">{item.title.split(' ')[0]}</div>
                      <small className="text-muted font-monospace">{item.sku || 'N/A'}</small>
                    </td>
                  ))}
                </tr>

                {/* Pricing & Value Comparison */}
                <tr>
                  <th className="bg-light text-secondary small fw-bold">Effective Price</th>
                  {compareItems.map(item => {
                    const price = Number(item.price);
                    const discountPrice = item.discount_price ? Number(item.discount_price) : null;
                    const finalPrice = discountPrice || price;
                    const savings = discountPrice ? (price - discountPrice) : 0;
                    return (
                      <td key={item.id} className="text-center">
                        <div className="fw-black text-primary fs-5">{formatPrice(finalPrice)}</div>
                        {currency !== 'USD' && (
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            (${finalPrice.toFixed(2)} USD)
                          </div>
                        )}
                        {savings > 0 && (
                          <small className="text-success fw-semibold d-block">Save {formatPrice(savings)} (Instant Promo)</small>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Rating & Customer Sentiment */}
                <tr>
                  <th className="bg-light text-secondary small fw-bold">Customer Rating</th>
                  {compareItems.map(item => (
                    <td key={item.id} className="text-center">
                      <div className="fw-bold text-dark">{Number(item.rating || 0).toFixed(1)} / 5.0</div>
                      <small className="text-muted">{item.num_reviews || 0} verified customer reviews</small>
                    </td>
                  ))}
                </tr>

                {/* Inventory Status */}
                <tr>
                  <th className="bg-light text-secondary small fw-bold">Inventory Status</th>
                  {compareItems.map(item => (
                    <td key={item.id} className="text-center">
                      {item.stock_quantity > 0 ? (
                        <div className="text-success fw-semibold">
                          <i className="bi bi-check-circle-fill me-1"></i>Ready to Dispatch ({item.stock_quantity} units)
                        </div>
                      ) : (
                        <div className="text-danger fw-semibold">
                          <i className="bi bi-x-circle-fill me-1"></i>Currently Backordered
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Delivery Guarantee */}
                <tr>
                  <th className="bg-light text-secondary small fw-bold">Delivery Estimate</th>
                  {compareItems.map(item => {
                    const finalPrice = Number(item.discount_price || item.price);
                    return (
                      <td key={item.id} className="text-center small">
                        <div className="fw-semibold text-dark">
                          {finalPrice >= 500 ? 'Free Express Delivery' : `Standard Ground (${formatPrice(15)})`}
                        </div>
                        <small className="text-muted">Estimated 3–5 business days</small>
                      </td>
                    );
                  })}
                </tr>

                {/* Technical Specifications Section Header */}
                <tr className="table-active">
                  <th colSpan={compareItems.length + 1} className="py-2 px-3 fw-bold text-navy">
                    <i className="bi bi-cpu me-2 text-primary"></i>Technical Specifications Comparison
                  </th>
                </tr>

                {allSpecKeys.length > 0 ? (
                  allSpecKeys.map(key => (
                    <tr key={key}>
                      <th className="bg-light text-secondary small fw-semibold">{key}</th>
                      {compareItems.map(item => {
                        const val = item.specifications && item.specifications[key];
                        return (
                          <td key={item.id} className="text-center text-dark">
                            {val ? (
                              <span className="fw-medium">{val}</span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={compareItems.length + 1} className="text-center text-muted py-3">
                      Standard marketplace technical specs apply.
                    </td>
                  </tr>
                )}

                {/* Summary / Overview */}
                <tr>
                  <th className="bg-light text-secondary small fw-bold">Summary & Highlights</th>
                  {compareItems.map(item => (
                    <td key={item.id} className="small text-secondary p-3">
                      {item.short_description || 'Standard manufacturer warranty and specifications.'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
