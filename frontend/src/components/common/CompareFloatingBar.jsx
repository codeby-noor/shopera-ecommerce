import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { useCurrency } from '../../context/CurrencyContext';

const CompareFloatingBar = () => {
  const { compareItems, removeFromCompare, clearCompare, maxItems } = useCompare();
  const { formatPrice } = useCurrency();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Don't show the floating tray on the compare page itself
  if (compareItems.length === 0 || location.pathname === '/compare') {
    return null;
  }

  return (
    <aside
      className="compare-floating-tray position-fixed bottom-0 start-50 translate-middle-x mb-3 shadow-2xl z-index-1050"
      style={{ zIndex: 1050, width: '92%', maxWidth: '780px' }}
      aria-label="Product comparison dock"
    >
      <div className="card border-0 rounded-4 shadow-lg overflow-hidden bg-white border border-primary border-opacity-25">
        {/* Tray Header */}
        <div
          className="px-3 py-2 bg-navy text-white d-flex justify-content-between align-items-center cursor-pointer"
          style={{ background: 'var(--color-navy)' }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-primary px-2 py-1 small fw-bold">
              {compareItems.length} / {maxItems}
            </span>
            <span className="small fw-bold">Product Comparison Dock</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-link text-white text-decoration-none p-0 small opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(!collapsed);
              }}
              aria-label={collapsed ? 'Expand comparison dock' : 'Collapse comparison dock'}
            >
              <i className={`bi ${collapsed ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </button>
          </div>
        </div>

        {/* Tray Content */}
        {!collapsed && (
          <div className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Product Thumbnails */}
            <div className="d-flex align-items-center gap-2 flex-grow-1 overflow-x-auto py-1">
              {compareItems.map(item => (
                <div
                  key={item.id}
                  className="position-relative border rounded-3 p-1 bg-light d-flex align-items-center gap-2"
                  style={{ minWidth: '130px', maxWidth: '160px' }}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{ width: '38px', height: '38px', objectFit: 'contain' }}
                    className="rounded-2 bg-white"
                  />
                  <div className="text-truncate flex-grow-1" style={{ fontSize: '0.72rem' }}>
                    <strong className="d-block text-truncate text-dark">{item.title}</strong>
                    <span className="text-primary fw-bold">{formatPrice(item.discount_price || item.price)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0 ms-auto"
                    onClick={() => removeFromCompare(item.id)}
                    title={`Remove ${item.title}`}
                    aria-label={`Remove ${item.title}`}
                  >
                    <i className="bi bi-x fs-6"></i>
                  </button>
                </div>
              ))}

              {/* Empty placeholder slots */}
              {Array.from({ length: maxItems - compareItems.length }).map((_, idx) => (
                <div
                  key={idx}
                  className="border border-dashed rounded-3 p-2 d-none d-sm-flex align-items-center justify-content-center text-muted small"
                  style={{ width: '90px', height: '48px', fontSize: '0.7rem' }}
                >
                  <span>+ Slot</span>
                </div>
              ))}
            </div>

            {/* Tray Actions */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                onClick={clearCompare}
              >
                Clear
              </button>
              <Link
                to="/compare"
                className="btn btn-sm btn-shopera-primary rounded-pill px-4 fw-bold text-nowrap"
              >
                <i className="bi bi-arrow-left-right me-1"></i>Compare Now ({compareItems.length})
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default CompareFloatingBar;
