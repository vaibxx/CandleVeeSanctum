import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { SearchBar } from './SearchBar';
import { CartIcon } from './CartIcon';
import './Header.css';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isHomePage = location.pathname === '/';

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isHomePage ? 'home-header' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <h1 className="logo-text">Vee Sanctum</h1>
            <span className="logo-tagline">Premium Candles</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul className="nav-list">
              <li>
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-dropdown">
                <button className="nav-link dropdown-toggle">
                  Shop by Mood
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="dropdown-menu">
                  <Link to="/products?mood=relaxing" className="dropdown-link">
                    <span className="mood-indicator relaxing"></span>
                    Relaxing
                  </Link>
                  <Link to="/products?mood=energizing" className="dropdown-link">
                    <span className="mood-indicator energizing"></span>
                    Energizing
                  </Link>
                  <Link to="/products?mood=romantic" className="dropdown-link">
                    <span className="mood-indicator romantic"></span>
                    Romantic
                  </Link>
                </div>
              </li>
              <li>
                <Link to="/products" className="nav-link">All Products</Link>
              </li>
            </ul>
          </nav>

          {/* Search Bar */}
          <div className="header-search">
            <SearchBar compact={true} />
          </div>

          {/* Action Buttons */}
          <div className="header-actions">
            <Link to="/cart" className="action-btn cart-btn">
              <CartIcon count={cartCount} />
              <span className="action-label">Cart</span>
            </Link>

            {isAuthenticated ? (
              <div className="user-menu">
                <button className="action-btn user-btn">
                  <span className="user-avatar">
                    {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                  </span>
                  <span className="action-label">Account</span>
                </button>
                <div className="user-dropdown">
                  <Link to="/account" className="dropdown-link">
                    My Profile
                  </Link>
                  {user.is_admin && (
                    <Link to="/admin" className="dropdown-link">
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-link logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline btn-small">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-small">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            <div className="mobile-search">
              <SearchBar />
            </div>

            <nav className="mobile-nav-menu">
              <ul className="mobile-nav-list">
                <li>
                  <Link to="/" className="mobile-nav-link">Home</Link>
                </li>
                <li>
                  <Link to="/products" className="mobile-nav-link">All Products</Link>
                </li>
                <li>
                  <div className="mobile-nav-subtitle">Shop by Mood</div>
                  <ul className="mobile-nav-sublist">
                    <li>
                      <Link to="/products?mood=relaxing" className="mobile-nav-link mood-link">
                        <span className="mood-indicator relaxing"></span>
                        Relaxing
                      </Link>
                    </li>
                    <li>
                      <Link to="/products?mood=energizing" className="mobile-nav-link mood-link">
                        <span className="mood-indicator energizing"></span>
                        Energizing
                      </Link>
                    </li>
                    <li>
                      <Link to="/products?mood=romantic" className="mobile-nav-link mood-link">
                        <span className="mood-indicator romantic"></span>
                        Romantic
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>

            {!isAuthenticated && (
              <div className="mobile-auth">
                <Link to="/login" className="btn btn-outline btn-large mobile-auth-btn">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-large mobile-auth-btn">
                  Sign Up
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="mobile-user-menu">
                <div className="mobile-user-info">
                  <span className="mobile-user-avatar">
                    {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                  </span>
                  <span className="mobile-user-name">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                <ul className="mobile-user-nav">
                  <li>
                    <Link to="/account" className="mobile-nav-link">
                      My Profile
                    </Link>
                  </li>
                  {user.is_admin && (
                    <li>
                      <Link to="/admin" className="mobile-nav-link">
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};