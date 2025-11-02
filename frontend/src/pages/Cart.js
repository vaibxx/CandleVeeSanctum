import React from 'react';
import { useCart } from '../contexts/CartContext';

export const Cart = () => {
  const { items, total } = useCart();

  return (
    <div className="container">
      <h1>Shopping Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id}>
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>${item.price}</p>
            </div>
          ))}
          <h2>Total: ${total}</h2>
        </div>
      )}
    </div>
  );
};