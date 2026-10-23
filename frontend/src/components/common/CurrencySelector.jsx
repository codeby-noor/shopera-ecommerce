import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const CurrencySelector = ({ variant = 'navbar' }) => {
  const { currency, setCurrency, availableCurrencies, currentCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape key press
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    setCurrency(code);
    setIsOpen(false);
  };

  const isFooter = variant === 'footer';

  return (
    <div
      ref={dropdownRef}
      className={`currency-selector-wrapper position-relative ${variant}`}
      style={{ display: 'inline-block' }}
    >
      {/* Interactive Trigger Button */}
      <button
        type="button"
        id="currencyDropdownBtn"
        className="btn btn-sm btn-light border rounded-pill d-flex align-items-center gap-1 px-2 py-1 shadow-xs"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current currency: ${currentCurrency.name}. Click to change.`}
        title={`Active currency: ${currentCurrency.name} (${currentCurrency.code})`}
        style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          background: '#FFFFFF',
          minHeight: '34px',
          cursor: 'pointer'
        }}
      >
        <span className="fs-6" aria-hidden="true">{currentCurrency.flag}</span>
        <span className="fw-bold text-dark">{currentCurrency.code}</span>
        <span className="text-muted" style={{ fontSize: '0.75rem' }}>({currentCurrency.symbol})</span>
        <i
          className={`bi bi-chevron-${isFooter ? (isOpen ? 'down' : 'up') : (isOpen ? 'up' : 'down')} text-muted ms-1`}
          style={{ fontSize: '0.68rem', transition: 'transform 0.2s ease' }}
          aria-hidden="true"
        ></i>
      </button>

      {/* React-controlled Dropdown Menu */}
      {isOpen && (
        <ul
          className="dropdown-menu show shadow-lg rounded-4 p-2 border-0 position-absolute"
          role="listbox"
          aria-label="Select Store Currency"
          style={{
            minWidth: '220px',
            zIndex: 1070,
            right: isFooter ? 'auto' : 0,
            left: isFooter ? 0 : 'auto',
            bottom: isFooter ? 'calc(100% + 8px)' : 'auto',
            top: isFooter ? 'auto' : 'calc(100% + 8px)',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            margin: 0
          }}
        >
          <li className="px-3 py-2 border-bottom mb-1" role="presentation">
            <small
              className="text-muted fw-bold text-uppercase d-block"
              style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}
            >
              Select Display Currency
            </small>
          </li>

          {availableCurrencies.map((c) => {
            const isSelected = currency === c.code;
            return (
              <li key={c.code} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`dropdown-item rounded-3 d-flex align-items-center justify-content-between px-3 py-2 w-100 border-0 ${
                    isSelected ? 'active fw-bold' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                    color: isSelected ? 'var(--color-primary, #FF6B35)' : '#1E293B',
                    transition: 'background-color 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelect(c.code)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5" aria-hidden="true">{c.flag}</span>
                    <div className="text-start">
                      <span className="d-block fw-bold" style={{ fontSize: '0.84rem' }}>
                        {c.code} <span className="text-muted fw-normal">({c.symbol})</span>
                      </span>
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                        {c.name}
                      </small>
                    </div>
                  </div>
                  {isSelected && (
                    <i className="bi bi-check-circle-fill text-primary ms-2 fs-6" aria-hidden="true"></i>
                  )}
                </button>
              </li>
            );
          })}

          <li className="mt-2 pt-2 border-top px-3 pb-1" role="presentation">
            <small className="text-muted d-block" style={{ fontSize: '0.68rem', lineHeight: 1.35 }}>
              Base catalog settled in USD. Fixed benchmark rates applied for visitor convenience.
            </small>
          </li>
        </ul>
      )}
    </div>
  );
};

export default CurrencySelector;
