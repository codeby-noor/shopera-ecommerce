import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShoperaLogo from '../components/common/ShoperaLogo';

const NotFound = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="not-found-page py-5 my-auto d-flex align-items-center" style={{ minHeight: '75vh' }}>
      <div className="container text-center">
        <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 mx-auto bg-white" style={{ maxWidth: '640px' }}>
          <div className="mb-3">
            <ShoperaLogo size="md" theme="light" withTagline={false} />
          </div>

          <div className="display-1 fw-black text-gradient mb-2" style={{ letterSpacing: '-0.04em' }}>
            404
          </div>
          <h2 className="fw-bold text-navy mb-3">Product or Page Not Found</h2>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '440px' }}>
            The page, collection, or hardware model you are looking for may have been moved, renamed, or is currently out of catalogue circulation.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="mb-4 mx-auto" style={{ maxWidth: '420px' }}>
            <div className="input-group rounded-pill border border-2 overflow-hidden p-1 shadow-2xs">
              <input
                type="text"
                className="form-control border-0 ps-3 bg-transparent"
                placeholder="Search products or brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-shopera-primary rounded-pill px-4 fw-bold" type="submit">
                Search
              </button>
            </div>
          </form>

          {/* Quick Category Shortcuts */}
          <div className="mb-4">
            <small className="text-secondary fw-semibold text-uppercase d-block mb-2" style={{ letterSpacing: '0.05em' }}>
              Popular Destinations
            </small>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Link to="/products?category=laptops-workstations" className="badge bg-light text-navy text-decoration-none py-2 px-3 rounded-pill">
                Laptops
              </Link>
              <Link to="/products?category=smartphones-tablets" className="badge bg-light text-navy text-decoration-none py-2 px-3 rounded-pill">
                Smartphones
              </Link>
              <Link to="/products?category=fashion-men" className="badge bg-light text-navy text-decoration-none py-2 px-3 rounded-pill">
                Men's Fashion
              </Link>
              <Link to="/products?category=shoes-footwear" className="badge bg-light text-navy text-decoration-none py-2 px-3 rounded-pill">
                Shoes & Footwear
              </Link>
              <Link to="/products?category=home-kitchen" className="badge bg-light text-navy text-decoration-none py-2 px-3 rounded-pill">
                Home & Kitchen
              </Link>
            </div>
          </div>

          <div>
            <Link to="/" className="btn btn-shopera-primary rounded-pill px-5 py-2 fw-bold">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
