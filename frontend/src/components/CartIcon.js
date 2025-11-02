import React from 'react';
import './CartIcon.css';

export const CartIcon = ({ count = 0 }) => {
  return (
    <div className="cart-icon">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="cart-svg"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      {count > 0 && (
        <span className="cart-badge">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};