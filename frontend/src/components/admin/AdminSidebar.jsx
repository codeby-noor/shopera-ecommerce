import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ShoperaLogo from '../common/ShoperaLogo';

const AdminSidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="admin-sidebar">
      {/* Admin Header */}
      <div className="px-3 pb-3 mb-3 border-bottom border-secondary border-opacity-50 d-none d-lg-block">
        <div className="mb-2">
          <ShoperaLogo size="sm" theme="dark" asLink={false} />
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-secondary border-opacity-25">
          <span className="badge rounded-pill fw-bold" style={{ background: 'var(--color-primary)', color: '#FFFFFF', fontSize: '0.68rem' }}>
            ADMIN CONSOLE
          </span>
          <small className="text-secondary" style={{ fontSize: '0.72rem' }}>v2.0 Marketplace</small>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="d-flex flex-lg-column gap-1 w-100">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-speedometer2 fs-5"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-box-seam fs-5"></i>
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-tags fs-5"></i>
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-receipt fs-5"></i>
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/admin/customers"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-people fs-5"></i>
          <span>Customers</span>
        </NavLink>

        <NavLink
          to="/admin/coupons"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-ticket-perforated fs-5"></i>
          <span>Coupons</span>
        </NavLink>

        <NavLink
          to="/admin/reviews"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-chat-square-quote fs-5"></i>
          <span>Reviews Moderation</span>
        </NavLink>
      </nav>

      {/* Footer Return to Store */}
      <div className="mt-auto pt-3 border-top border-secondary d-none d-lg-block">
        <Link to="/" className="admin-nav-item text-secondary">
          <i className="bi bi-arrow-left-circle fs-5"></i>
          <span>Return to Store</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
