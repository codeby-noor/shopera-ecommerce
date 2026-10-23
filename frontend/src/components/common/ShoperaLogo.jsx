import React from 'react';
import { Link } from 'react-router-dom';

const ShoperaLogo = ({ 
  size = 'md', 
  theme = 'light', 
  withTagline = false, 
  asLink = true,
  className = '' 
}) => {
  // Dimension definitions
  const dimensions = {
    sm: { icon: 26, font: '1.2rem', tagline: '0.65rem' },
    md: { icon: 34, font: '1.5rem', tagline: '0.72rem' },
    lg: { icon: 44, font: '2.1rem', tagline: '0.85rem' }
  }[size] || { icon: 34, font: '1.5rem', tagline: '0.72rem' };

  const isDark = theme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#14213D';
  const tagColor = isDark ? 'rgba(255, 255, 255, 0.7)' : '#64748B';

  const logoContent = (
    <div className={`shopera-logo-container d-inline-flex align-items-center gap-2 ${className}`}>
      {/* Precision Shopping Bag Icon with Modern Gradients */}
      <svg 
        width={dimensions.icon} 
        height={dimensions.icon} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shopera-bag-icon flex-shrink-0"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(255, 107, 53, 0.28))' }}
      >
        <defs>
          <linearGradient id="shoperaBagGrad" x1="4" y1="12" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="55%" stopColor="#F72585" />
            <stop offset="100%" stopColor="#7209B7" />
          </linearGradient>
          <linearGradient id="shoperaHandleGrad" x1="16" y1="4" x2="32" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#F72585" />
          </linearGradient>
          <linearGradient id="shoperaSparkleGrad" x1="20" y1="20" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFF0EB" />
          </linearGradient>
        </defs>

        {/* Bag Handle */}
        <path 
          d="M17 16V12C17 8.13401 20.134 5 24 5C27.866 5 31 8.13401 31 12V16" 
          stroke="url(#shoperaHandleGrad)" 
          strokeWidth="3.6" 
          strokeLinecap="round" 
        />

        {/* Main Bag Body */}
        <rect 
          x="6" 
          y="14" 
          width="36" 
          height="29" 
          rx="7" 
          fill="url(#shoperaBagGrad)" 
        />

        {/* Dynamic Fold Accent Line */}
        <path 
          d="M6 21H42" 
          stroke="rgba(255, 255, 255, 0.25)" 
          strokeWidth="1.5" 
          strokeDasharray="2 2" 
        />

        {/* Centered Sparkle Star Symbol */}
        <path 
          d="M24 23L25.3 27.2C25.5 27.8 26.2 28.5 26.8 28.7L31 30L26.8 31.3C26.2 31.5 25.5 32.2 25.3 32.8L24 37L22.7 32.8C22.5 32.2 21.8 31.5 21.2 31.3L17 30L21.2 28.7C21.8 28.5 22.5 27.8 22.7 27.2L24 23Z" 
          fill="url(#shoperaSparkleGrad)" 
        />
      </svg>

      {/* Typography */}
      <div className="d-flex flex-column justify-content-center text-start">
        <div 
          className="shopera-wordmark fw-extrabold tracking-tight" 
          style={{ 
            fontSize: dimensions.font, 
            lineHeight: 1, 
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.035em'
          }}
        >
          <span style={{ color: textColor }}>SHOP</span>
          <span 
            style={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #F72585 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800
            }}
          >
            ERA
          </span>
        </div>
        {withTagline && (
          <span 
            className="shopera-tagline fw-medium text-nowrap"
            style={{ 
              fontSize: dimensions.tagline, 
              color: tagColor, 
              letterSpacing: '0.04em',
              marginTop: '3px'
            }}
          >
            Shop More. Live Better.
          </span>
        )}
      </div>
    </div>
  );

  if (!asLink) {
    return logoContent;
  }

  return (
    <Link to="/" className="text-decoration-none d-inline-block">
      {logoContent}
    </Link>
  );
};

export default ShoperaLogo;
