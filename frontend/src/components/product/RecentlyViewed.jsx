import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import RatingStars from './RatingStars';

const STORAGE_KEY = 'shopera_recently_viewed';

export const recordRecentlyViewed = (product) => {
  if (!product || !product.id) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list = raw ? JSON.parse(raw) : [];

    // Filter out current product to put it at the very top
    list = list.filter(item => item.id !== product.id);

    // Save only public catalog metadata
    const record = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      discount_price: product.discount_price,
      image_url: product.image_url,
      category_name: product.category_name,
      rating: product.rating,
      num_reviews: product.num_reviews,
      viewedAt: Date.now()
    };

    list.unshift(record);

    // Keep max 10 items
    if (list.length > 10) {
      list = list.slice(0, 10);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to update recently viewed products:', e);
  }
};

const RecentlyViewed = ({ currentProductId = null, title = 'Recently Viewed by You' }) => {
  const [items, setItems] = useState([]);
  const { formatPrice } = useCurrency();

  const loadItems = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let list = raw ? JSON.parse(raw) : [];
      if (currentProductId) {
        list = list.filter(item => item.id !== currentProductId);
      }
      setItems(list.slice(0, 6));
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();
  }, [currentProductId]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="recently-viewed-section my-5 pt-4 border-top" aria-label="Recently viewed products">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-secondary bg-opacity-10 text-secondary fw-bold rounded-pill px-3 py-1 small mb-1">
            BROWSING HISTORY
          </span>
          <h3 className="h4 fw-black text-navy mb-0">{title}</h3>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-link text-muted text-decoration-none small p-0"
          onClick={handleClearHistory}
          title="Clear browsing history on this device"
        >
          <i className="bi bi-x-circle me-1"></i>Clear History
        </button>
      </div>

      <div className="row g-3">
        {items.map(item => {
          const finalPrice = item.discount_price ? Number(item.discount_price) : Number(item.price);
          return (
            <div key={item.id} className="col-xl-2 col-lg-3 col-md-4 col-6">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-2 bg-white product-card-hover transition-all">
                <div className="text-center p-2">
                  <Link to={`/products/${item.slug || item.id}`}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="img-fluid rounded-3"
                      style={{ height: '110px', objectFit: 'contain' }}
                      loading="lazy"
                    />
                  </Link>
                </div>
                <div className="card-body p-2 d-flex flex-column">
                  <small className="text-muted text-truncate mb-1" style={{ fontSize: '0.68rem' }}>
                    {item.category_name || 'Marketplace'}
                  </small>
                  <Link
                    to={`/products/${item.slug || item.id}`}
                    className="fw-bold text-dark text-decoration-none text-hover-primary small line-clamp-2 mb-2"
                    style={{ minHeight: '2.2rem', lineHeight: '1.2' }}
                  >
                    {item.title}
                  </Link>
                  <div className="mt-auto">
                    <div className="fw-black text-primary">{formatPrice(finalPrice)}</div>
                    <div className="small">
                      <RatingStars rating={item.rating || 0} reviewsCount={item.num_reviews || 0} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecentlyViewed;
