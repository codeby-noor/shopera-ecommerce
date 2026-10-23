import React from 'react';

const StatCard = ({ title, value, icon, iconBg = 'bg-primary-subtle text-primary', subtitle, trend }) => {
  return (
    <div className="stat-kpi-card">
      <div className={`stat-kpi-icon ${iconBg}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <span className="text-muted small fw-semibold text-uppercase tracking-wider">
          {title}
        </span>
        <h3 className="fw-bold mb-0 text-dark">
          {value}
        </h3>
        {subtitle && (
          <small className="text-muted d-block mt-1">
            {subtitle}
          </small>
        )}
      </div>
    </div>
  );
};

export default StatCard;
