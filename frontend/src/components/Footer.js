import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <Link to="/" className="footer-logo">
              <h3>Vee Sanctum</h3>
              <p className="footer-tagline">Premium Candles for Everyday Moments</p>
            </Link>
            <p className="footer-description">
              Discover our handcrafted collection of premium candles designed to transform your space and elevate your mood.
            </p>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Pinterest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0z"></path>
                  <circle cx="8" cy="8" r="6"></circle>
                  <circle cx="8" cy="8" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Section */}
          <div className="footer-section">
            <h4 className="footer-title">Shop</h4>
            <ul className="footer-links">
              <li>
                <Link to="/products" className="footer-link">All Products</Link>
              </li>
              <li>
                <Link to="/products?mood=relaxing" className="footer-link">Relaxing Candles</Link>
              </li>
              <li>
                <Link to="/products?mood=energizing" className="footer-link">Energizing Candles</Link>
              </li>
              <li>
                <Link to="/products?mood=romantic" className="footer-link">Romantic Candles</Link>
              </li>
              <li>
                <Link to="/products?type=gift_set" className="footer-link">Gift Sets</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Section */}
          <div className="footer-section">
            <h4 className="footer-title">Customer Service</h4>
            <ul className="footer-links">
              <li>
                <Link to="/contact" className="footer-link">Contact Us</Link>
              </li>
              <li>
                <Link to="/shipping" className="footer-link">Shipping Information</Link>
              </li>
              <li>
                <Link to="/returns" className="footer-link">Returns & Exchanges</Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">FAQ</Link>
              </li>
              <li>
                <Link to="/size-guide" className="footer-link">Size Guide</Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li>
                <Link to="/about" className="footer-link">About Us</Link>
              </li>
              <li>
                <Link to="/sustainability" className="footer-link">Sustainability</Link>
              </li>
              <li>
                <Link to="/careers" className="footer-link">Careers</Link>
              </li>
              <li>
                <Link to="/press" className="footer-link">Press</Link>
              </li>
              <li>
                <Link to="/wholesale" className="footer-link">Wholesale</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="footer-section footer-newsletter">
            <h4 className="footer-title">Stay Connected</h4>
            <p className="newsletter-description">
              Subscribe to receive special offers, new product updates, and 10% off your first order.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-button">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Vee Sanctum. All rights reserved.
            </p>
            <div className="footer-legal">
              <Link to="/privacy" className="legal-link">Privacy Policy</Link>
              <Link to="/terms" className="legal-link">Terms of Service</Link>
              <Link to="/accessibility" className="legal-link">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};