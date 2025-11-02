import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './ProductCard.css';

export const ProductCard = ({ product, size = 'medium' }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const success = await addToCart(product.id, 1);
    if (success) {
      // Optional: Add visual feedback
      const button = e.target;
      const originalText = button.textContent;
      button.textContent = 'Added!';
      button.disabled = true;

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'relaxing':
        return 'var(--mood-relaxing)';
      case 'energizing':
        return 'var(--mood-energizing)';
      case 'romantic':
        return 'var(--mood-romantic)';
      default:
        return 'var(--color-gray)';
    }
  };

  return (
    <div className={`product-card ${size}`}>
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image-container">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="product-image"
              loading="lazy"
            />
          ) : (
            <div className="product-image-placeholder">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
              </svg>
            </div>
          )}

          {/* Mood indicator */}
          <div
            className="mood-indicator"
            style={{ backgroundColor: getMoodColor(product.mood_category) }}
            title={product.mood_category}
          ></div>

          {/* Stock indicator */}
          {product.stock_quantity <= 5 && (
            <div className="stock-indicator low-stock">
              Only {product.stock_quantity} left
            </div>
          )}
        </div>

        <div className="product-content">
          <div className="product-header">
            <h3 className="product-name">{product.name}</h3>
            <div className="product-meta">
              <span className="product-price">{formatPrice(product.price)}</span>
              <span
                className="product-mood"
                style={{ color: getMoodColor(product.mood_category) }}
              >
                {product.mood_category}
              </span>
            </div>
          </div>

          {product.size && (
            <div className="product-size">{product.size}</div>
          )}

          {product.burn_time && (
            <div className="product-burn-time">Burn time: {product.burn_time}</div>
          )}

          <p className="product-description">
            {product.description?.substring(0, 100)}
            {product.description && product.description.length > 100 && '...'}
          </p>
        </div>
      </Link>

      <div className="product-actions">
        <button
          onClick={handleAddToCart}
          className="btn btn-primary add-to-cart-btn"
          disabled={product.stock_quantity === 0}
        >
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};