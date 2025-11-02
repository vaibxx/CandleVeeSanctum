import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './Home.css';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [relaxingProducts, setRelaxingProducts] = useState([]);
  const [energizingProducts, setEnergizingProducts] = useState([]);
  const [romanticProducts, setRomanticProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);

        // Load all data in parallel
        const [featuredRes, relaxingRes, energizingRes, romanticRes] = await Promise.all([
          productsAPI.getFeatured(),
          productsAPI.getByMood('relaxing', 4),
          productsAPI.getByMood('energizing', 4),
          productsAPI.getByMood('romantic', 4)
        ]);

        setFeaturedProducts(featuredRes.data.data.products || []);
        setRelaxingProducts(relaxingRes.data.data.products || []);
        setEnergizingProducts(energizingRes.data.data.products || []);
        setRomanticProducts(romanticRes.data.data.products || []);
      } catch (error) {
        console.error('Failed to load home data:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (isLoading) {
    return (
      <div className="home-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <div className="container">
          <h2>Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <h1 className="hero-title">
                Transform Your Space with
                <span className="hero-accent"> Premium Candles</span>
              </h1>
              <p className="hero-subtitle">
                Handcrafted candles designed to elevate your mood and create unforgettable moments.
              </p>
              <div className="hero-actions">
                <Link to="/products" className="btn btn-primary btn-large">
                  Shop All Candles
                </Link>
                <Link to="/products?mood=relaxing" className="btn btn-outline btn-large">
                  Shop by Mood
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Discover our handpicked selection of premium candles</p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Mood Categories */}
      <section className="mood-categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Mood</h2>
            <p className="section-subtitle">Find the perfect candle for your moment</p>
          </div>

          <div className="mood-grid">
            <Link to="/products?mood=relaxing" className="mood-card relaxing">
              <div className="mood-content">
                <h3 className="mood-title">Relaxing</h3>
                <p className="mood-description">Unwind and find your inner peace</p>
                <span className="mood-count">{relaxingProducts.length} Products</span>
              </div>
              <div className="mood-overlay"></div>
            </Link>

            <Link to="/products?mood=energizing" className="mood-card energizing">
              <div className="mood-content">
                <h3 className="mood-title">Energizing</h3>
                <p className="mood-description">Boost your mood and vitality</p>
                <span className="mood-count">{energizingProducts.length} Products</span>
              </div>
              <div className="mood-overlay"></div>
            </Link>

            <Link to="/products?mood=romantic" className="mood-card romantic">
              <div className="mood-content">
                <h3 className="mood-title">Romantic</h3>
                <p className="mood-description">Create intimate, memorable moments</p>
                <span className="mood-count">{romanticProducts.length} Products</span>
              </div>
              <div className="mood-overlay"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Product Previews by Mood */}
      <section className="mood-products">
        <div className="container">
          {/* Relaxing Products */}
          <div className="mood-product-section">
            <div className="mood-product-header">
              <h3 className="mood-product-title relaxing">
                <span className="mood-indicator"></span>
                Relaxing Collection
              </h3>
              <Link to="/products?mood=relaxing" className="view-all-link">
                View All →
              </Link>
            </div>
            {relaxingProducts.length > 0 ? (
              <div className="products-grid small">
                {relaxingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Relaxing products coming soon.</p>
              </div>
            )}
          </div>

          {/* Energizing Products */}
          <div className="mood-product-section">
            <div className="mood-product-header">
              <h3 className="mood-product-title energizing">
                <span className="mood-indicator"></span>
                Energizing Collection
              </h3>
              <Link to="/products?mood=energizing" className="view-all-link">
                View All →
              </Link>
            </div>
            {energizingProducts.length > 0 ? (
              <div className="products-grid small">
                {energizingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Energizing products coming soon.</p>
              </div>
            )}
          </div>

          {/* Romantic Products */}
          <div className="mood-product-section">
            <div className="mood-product-header">
              <h3 className="mood-product-title romantic">
                <span className="mood-indicator"></span>
                Romantic Collection
              </h3>
              <Link to="/products?mood=romantic" className="view-all-link">
                View All →
              </Link>
            </div>
            {romanticProducts.length > 0 ? (
              <div className="products-grid small">
                {romanticProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Romantic products coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Premium Quality</h3>
              <p className="feature-description">
                Made with the finest ingredients and essential oils for a clean, long-lasting burn.
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Handcrafted</h3>
              <p className="feature-description">
                Each candle is carefully handcrafted with attention to detail and quality.
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Eco-Friendly</h3>
              <p className="feature-description">
                Sustainable materials and environmentally conscious production methods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Space?</h2>
            <p className="cta-subtitle">
              Explore our collection and find the perfect candle for your mood.
            </p>
            <Link to="/products" className="btn btn-primary btn-large">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};