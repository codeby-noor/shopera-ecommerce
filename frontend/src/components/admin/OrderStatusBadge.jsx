import React from 'react';

const OrderStatusBadge = ({ status }) => {
  const normStatus = (status || 'pending').toLowerCase();

  const getIcon = () => {
    switch (normStatus) {
      case 'pending': return 'bi-hourglass-split';
      case 'processing': return 'bi-gear-wide-connected';
      case 'shipped': return 'bi-truck';
      case 'delivered': return 'bi-check-circle-fill';
      case 'cancelled': return 'bi-x-circle-fill';
      default: return 'bi-clock';
    }
  };

  return (
    <span className={`status-pill ${normStatus}`}>
      <i className={`bi ${getIcon()}`}></i>
      <span>{normStatus}</span>
    </span>
  );
};

export default OrderStatusBadge;
