import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter States from URL or defaults
  const queryQ = searchParams.get('q') || '';
  const queryCat = searchParams.get('category') || 'all';
  const queryBrand = searchParams.get('brand') || 'all';
  const querySort = searchParams.get('sort') || 'newest';
  const queryPage = parseInt(searchParams.get('page'), 10) || 1;
  const queryMinPrice = searchParams.get('min_price') || '';
  const queryMaxPrice = searchParams.get('max_price') || '';
  const queryInStock = searchParams.get('in_stock') === 'true';
  const queryFeatured = searchParams.get('featured') === '1' || searchParams.get('featured') === 'true';

  const [selectedCategory, setSelectedCategory] = useState(queryCat);
  const [selectedBrand, setSelectedBrand] = useState(queryBrand);
  const [selectedSort, setSelectedSort] = useState(querySort);
  const [minPrice, setMinPrice] = useState(queryMinPrice);
  const [maxPrice, setMaxPrice] = useState(queryMaxPrice);
  const [inStockOnly, setInStockOnly] = useState(queryInStock);
  const [featuredOnly, setFeaturedOnly] = useState(queryFeatured);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  // Sync state when URL params change
  useEffect(() => {
    setSelectedCategory(queryCat);
    setSelectedBrand(queryBrand);
    setSelectedSort(querySort);
    setMinPrice(queryMinPrice);
    setMaxPrice(queryMaxPrice);
    setInStockOnly(queryInStock);
    setFeaturedOnly(queryFeatured);
  }, [queryCat, queryBrand, querySort, queryMinPrice, queryMaxPrice, queryInStock, queryFeatured]);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoriesAPI.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Load brands available for the selected category (or whole marketplace)
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await productsAPI.getBrands({ category: queryCat !== 'all' ? queryCat : undefined });
        if (res.data.success) {
          setAvailableBrands(res.data.brands || []);
        }
      } catch (err) {
        console.error('Failed to load brands:', err);
      }
    };
    fetchBrands();
  }, [queryCat]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: queryPage,
        limit: 12,
        sort: querySort
      };

      if (queryQ) params.q = queryQ;
      if (queryCat && queryCat !== 'all') params.category = queryCat;
      if (queryBrand && queryBrand !== 'all') params.brand = queryBrand;
      if (queryMinPrice) params.min_price = queryMinPrice;
      if (queryMaxPrice) params.max_price = queryMaxPrice;
      if (queryInStock) params.in_stock = 1;
      if (queryFeatured) params.featured = 1;

      const res = await productsAPI.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [queryPage, querySort, queryQ, queryCat, queryBrand, queryMinPrice, queryMaxPrice, queryInStock, queryFeatured]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  const updateFilters = (newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach(key => {
      const val = newParams[key];
      if (val === undefined || val === null || val === '' || val === 'all') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    // Reset to page 1 on filter modification
    if (!newParams.page) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateFilters({ min_price: minPrice, max_price: maxPrice });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setFeaturedOnly(false);
    setSearchParams({});
  };

  // Find active category object for description
  const activeCategoryObj = categories.find(c => c.slug === queryCat);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    queryQ || (queryCat && queryCat !== 'all') || (queryBrand && queryBrand !== 'all') ||
    queryMinPrice || queryMaxPrice || queryInStock || queryFeatured
  );

  const activeFiltersCount = [
    queryCat && queryCat !== 'all',
    queryBrand && queryBrand !== 'all',
    Boolean(queryMinPrice || queryMaxPrice),
    queryInStock,
    queryFeatured,
    Boolean(queryQ)
  ].filter(Boolean).length;

  return (
    <div className="container py-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products" className="text-secondary text-decoration-none">Marketplace</Link></li>
          {activeCategoryObj && (
            <li className="breadcrumb-item active text-navy fw-semibold" aria-current="page">
              {activeCategoryObj.name}
            </li>
          )}
        </ol>
      </nav>

      {/* Header Banner & Title */}
      <div className="card border-0 rounded-4 shadow-sm p-4 p-md-5 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--color-primary)' }}>
                {activeCategoryObj ? 'CATEGORY CATALOGUE' : queryQ ? 'SEARCH RESULTS' : 'SHOPERA MARKETPLACE'}
              </span>
              <span className="text-secondary small">&bull; {pagination.total} Products Available</span>
            </div>
            <h1 className="h2 fw-black text-navy mb-2">
              {activeCategoryObj ? activeCategoryObj.name : queryQ ? `Results for "${queryQ}"` : 'All Products & Categories'}
            </h1>
            <p className="text-secondary mb-0" style={{ maxWidth: '720px' }}>
              {activeCategoryObj
                ? activeCategoryObj.description
                : 'Discover verified products across 12 distinct categories. Filter by brand, price range, stock availability, or popularity.'}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="sortSelect" className="small fw-semibold text-secondary text-nowrap">Sort by:</label>
            <select
              id="sortSelect"
              className="form-select form-select-sm rounded-pill border-secondary border-opacity-25 shadow-none fw-medium"
              style={{ width: '190px' }}
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                updateFilters({ sort: e.target.value });
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="d-flex flex-wrap align-items-center gap-2 pt-3 mt-3 border-top">
            <small className="text-secondary fw-bold text-uppercase me-1" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              Active Filters:
            </small>

            {queryQ && (
              <span className="badge bg-light text-navy border rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                <span>Keyword: "{queryQ}"</span>
                <i className="bi bi-x-circle-fill cursor-pointer text-secondary" onClick={() => updateFilters({ q: '' })}></i>
              </span>
            )}

            {queryCat && queryCat !== 'all' && (
              <span className="badge bg-light text-navy border rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                <span>Category: {activeCategoryObj?.name || queryCat}</span>
                <i className="bi bi-x-circle-fill cursor-pointer text-secondary" onClick={() => updateFilters({ category: 'all' })}></i>
              </span>
            )}

            {queryBrand && queryBrand !== 'all' && (
              <span className="badge bg-light text-navy border rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                <span>Brand: {queryBrand}</span>
                <i className="bi bi-x-circle-fill cursor-pointer text-secondary" onClick={() => updateFilters({ brand: 'all' })}></i>
              </span>
            )}

            {(queryMinPrice || queryMaxPrice) && (
              <span className="badge bg-light text-navy border rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                <span>Price: ${queryMinPrice || '0'} - ${queryMaxPrice || '&infin;'}</span>
                <i className="bi bi-x-circle-fill cursor-pointer text-secondary" onClick={() => updateFilters({ min_price: '', max_price: '' })}></i>
              </span>
            )}

            {queryInStock && (
              <span className="badge bg-light text-navy border rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                <span>In Stock Only</span>
                <i className="bi bi-x-circle-fill cursor-pointer text-secondary" onClick={() => updateFilters({ in_stock: '' })}></i>
              </span>
            )}

            {queryFeatured && (
              <span className="badge bg-light text-navy border rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                <span>Featured Deals</span>
                <i className="bi bi-x-circle-fill cursor-pointer text-secondary" onClick={() => updateFilters({ featured: '' })}></i>
              </span>
            )}

            <button
              className="btn btn-link btn-sm text-danger text-decoration-none fw-semibold p-0 ms-2"
              onClick={handleResetFilters}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Mobile Quick Filter & Sort Bar (< lg) */}
      <div className="d-lg-none mb-3">
        <div className="d-flex align-items-center justify-content-between bg-white p-2 px-3 rounded-4 border shadow-sm">
          <button
            type="button"
            className="btn btn-shopera-primary btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
            onClick={() => setMobileFilterOpen(true)}
            aria-label="Open filter options"
          >
            <i className="bi bi-sliders"></i>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="badge bg-white text-primary rounded-pill">{activeFiltersCount}</span>
            )}
          </button>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted d-none d-sm-inline">{pagination.total} items &bull;</span>
            <label htmlFor="mobileSortSelect" className="visually-hidden">Sort</label>
            <select
              id="mobileSortSelect"
              className="form-select form-select-sm rounded-pill border-secondary border-opacity-25 shadow-none"
              style={{ width: '150px' }}
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                updateFilters({ sort: e.target.value });
              }}
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="price_asc">Price: Low</option>
              <option value="price_desc">Price: High</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <>
          <div
            className="mobile-filter-backdrop"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          ></div>
          <div
            className="mobile-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
          >
            <div className="mobile-filter-drag-pill"></div>
            <div className="mobile-filter-header">
              <div>
                <h5 className="fw-bold mb-0 text-navy">Filters & Categories</h5>
                <small className="text-muted">{pagination.total} products available</small>
              </div>
              <button
                type="button"
                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '38px', height: '38px' }}
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <i className="bi bi-x-lg fs-6"></i>
              </button>
            </div>

            <div className="mobile-filter-body">
              {/* Categories */}
              <div className="mb-4">
                <label className="fw-bold small text-uppercase text-secondary mb-2 d-block">
                  Categories ({categories.length})
                </label>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                      selectedCategory === 'all' ? 'btn-shopera-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => {
                      setSelectedCategory('all');
                      updateFilters({ category: 'all', brand: 'all' });
                    }}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                        selectedCategory === c.slug ? 'btn-shopera-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => {
                        setSelectedCategory(c.slug);
                        updateFilters({ category: c.slug, brand: 'all' });
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="fw-bold small text-uppercase text-secondary mb-2 d-block">
                  Price Range ($ USD)
                </label>
                <form onSubmit={handlePriceApply} className="row g-2 align-items-center">
                  <div className="col-5">
                    <input
                      type="number"
                      className="form-control form-control-sm rounded-3"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <div className="col-2 text-center text-muted small">&ndash;</div>
                  <div className="col-5">
                    <input
                      type="number"
                      className="form-control form-control-sm rounded-3"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                  <div className="col-12 mt-2">
                    <button type="submit" className="btn btn-shopera-outline btn-sm w-100 rounded-pill">
                      Apply Price Filter
                    </button>
                  </div>
                </form>
              </div>

              {/* Brands */}
              {availableBrands.length > 0 && (
                <div className="mb-4">
                  <label className="fw-bold small text-uppercase text-secondary mb-2 d-block">
                    Brands ({availableBrands.length})
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        selectedBrand === 'all' ? 'btn-shopera-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => {
                        setSelectedBrand('all');
                        updateFilters({ brand: 'all' });
                      }}
                    >
                      All Brands
                    </button>
                    {availableBrands.map((b) => (
                      <button
                        key={b.brand}
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 py-1 ${
                          selectedBrand === b.brand ? 'btn-shopera-primary' : 'btn-outline-secondary'
                        }`}
                        onClick={() => {
                          setSelectedBrand(b.brand);
                          updateFilters({ brand: b.brand });
                        }}
                      >
                        {b.brand} ({b.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="mb-3">
                <label className="fw-bold small text-uppercase text-secondary mb-2 d-block">
                  Availability & Deals
                </label>
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="mobileInStockCheck"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      updateFilters({ in_stock: e.target.checked ? 'true' : '' });
                    }}
                  />
                  <label className="form-check-label small fw-medium" htmlFor="mobileInStockCheck">
                    In Stock Only
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="mobileFeaturedCheck"
                    checked={featuredOnly}
                    onChange={(e) => {
                      setFeaturedOnly(e.target.checked);
                      updateFilters({ featured: e.target.checked ? '1' : '' });
                    }}
                  />
                  <label className="form-check-label small fw-medium" htmlFor="mobileFeaturedCheck">
                    Featured Deals Only
                  </label>
                </div>
              </div>
            </div>

            <div className="mobile-filter-footer">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2 fw-semibold"
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
              >
                Clear All
              </button>
              <button
                type="button"
                className="btn btn-shopera-primary flex-grow-1 rounded-pill py-2 fw-bold"
                onClick={() => setMobileFilterOpen(false)}
              >
                Show {pagination.total} Products
              </button>
            </div>
          </div>
        </>
      )}

      <div className="row g-4">
        {/* Filter Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="filter-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-navy">Filter Products</h5>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none text-danger p-0 fw-semibold"
                  onClick={handleResetFilters}
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div className="mb-4">
              <label className="fw-bold small text-uppercase text-secondary mb-2 d-block" style={{ letterSpacing: '0.05em' }}>
                Categories ({categories.length})
              </label>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="catRadio"
                  id="cat-all"
                  checked={selectedCategory === 'all'}
                  onChange={() => {
                    setSelectedCategory('all');
                    updateFilters({ category: 'all', brand: 'all' });
                  }}
                />
                <label className="form-check-label small fw-medium" htmlFor="cat-all">
                  All Categories
                </label>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {categories.map((c) => (
                  <div key={c.id} className="form-check mb-2 d-flex justify-content-between align-items-center pe-2">
                    <div>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="catRadio"
                        id={`cat-${c.id}`}
                        checked={selectedCategory === c.slug}
                        onChange={() => {
                          setSelectedCategory(c.slug);
                          updateFilters({ category: c.slug, brand: 'all' });
                        }}
                      />
                      <label className="form-check-label small ms-1" htmlFor={`cat-${c.id}`}>
                        {c.name}
                      </label>
                    </div>
                    <span className="badge bg-light text-secondary border rounded-pill" style={{ fontSize: '0.7rem' }}>
                      {c.product_count || 10}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div className="mb-4 pt-3 border-top">
                <label className="fw-bold small text-uppercase text-secondary mb-2 d-block" style={{ letterSpacing: '0.05em' }}>
                  Brand ({availableBrands.length})
                </label>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="brandRadio"
                    id="brand-all"
                    checked={selectedBrand === 'all'}
                    onChange={() => {
                      setSelectedBrand('all');
                      updateFilters({ brand: 'all' });
                    }}
                  />
                  <label className="form-check-label small fw-medium" htmlFor="brand-all">
                    All Brands
                  </label>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {availableBrands.map((b) => (
                    <div key={b} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="brandRadio"
                        id={`brand-${b}`}
                        checked={selectedBrand === b}
                        onChange={() => {
                          setSelectedBrand(b);
                          updateFilters({ brand: b });
                        }}
                      />
                      <label className="form-check-label small" htmlFor={`brand-${b}`}>
                        {b}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="mb-4 pt-3 border-top">
              <label className="fw-bold small text-uppercase text-secondary mb-2 d-block" style={{ letterSpacing: '0.05em' }}>
                Price Range ($)
              </label>
              <form onSubmit={handlePriceApply} className="d-flex gap-2 align-items-center">
                <input
                  type="number"
                  className="form-control form-control-sm rounded-3"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
                <span className="text-secondary">-</span>
                <input
                  type="number"
                  className="form-control form-control-sm rounded-3"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
                <button type="submit" className="btn btn-sm btn-shopera-primary rounded-pill px-3">
                  Go
                </button>
              </form>
            </div>

            {/* Availability & Badges */}
            <div className="mb-4 pt-3 border-top">
              <label className="fw-bold small text-uppercase text-secondary mb-2 d-block" style={{ letterSpacing: '0.05em' }}>
                Availability & Deals
              </label>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inStockCheck"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    updateFilters({ in_stock: e.target.checked ? 'true' : '' });
                  }}
                />
                <label className="form-check-label small fw-medium" htmlFor="inStockCheck">
                  In Stock Only
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="featuredCheck"
                  checked={featuredOnly}
                  onChange={(e) => {
                    setFeaturedOnly(e.target.checked);
                    updateFilters({ featured: e.target.checked ? '1' : '' });
                  }}
                />
                <label className="form-check-label small fw-medium" htmlFor="featuredCheck">
                  Featured Deals Only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="col-lg-9">
          {loading ? (
            <div className="row g-2 g-sm-3 g-md-4 product-grid-adaptive">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="col-6 col-md-6 col-lg-4 product-col-adaptive">
                  <div className="card border-0 shadow-sm p-4 text-center rounded-4" style={{ height: '280px' }}>
                    <div className="spinner-border text-primary m-auto" role="status"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-4 bg-white">
              <div className="display-4 text-secondary mb-3">
                <i className="bi bi-search"></i>
              </div>
              <h4 className="fw-bold text-navy">No Matching Products Found</h4>
              <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '420px' }}>
                We couldn't find any products matching your selected search or filter criteria. Try adjusting the price range or clearing brand filters.
              </p>
              <div>
                <button className="btn btn-shopera-primary rounded-pill px-4" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-2 g-sm-3 g-md-4 product-grid-adaptive">
                {products.map((product) => (
                  <div key={product.id} className="col-6 col-md-6 col-lg-4 product-col-adaptive">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <nav className="d-flex justify-content-center mt-5" aria-label="Page navigation">
                  <ul className="pagination shadow-sm rounded-pill overflow-hidden">
                    <li className={`page-item ${pagination.page <= 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link px-3"
                        onClick={() => updateFilters({ page: pagination.page - 1 })}
                      >
                        <i className="bi bi-chevron-left me-1"></i>Previous
                      </button>
                    </li>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <li key={p} className={`page-item ${pagination.page === p ? 'active' : ''}`}>
                        <button
                          className="page-link px-3"
                          onClick={() => updateFilters({ page: p })}
                        >
                          {p}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.page >= pagination.pages ? 'disabled' : ''}`}>
                      <button
                        className="page-link px-3"
                        onClick={() => updateFilters({ page: pagination.page + 1 })}
                      >
                        Next<i className="bi bi-chevron-right ms-1"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
