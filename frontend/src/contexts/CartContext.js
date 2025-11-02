import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  count: 0,
  isLoading: false,
  error: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'CART_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        count: action.payload.items.reduce((sum, item) => sum + item.quantity, 0),
        isLoading: false,
        error: null,
      };

    case 'CART_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'CART_CLEAR':
      return {
        ...state,
        items: [],
        total: 0,
        count: 0,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Generate or retrieve session ID for guest carts
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // Fetch cart data
  const fetchCart = async () => {
    try {
      dispatch({ type: 'CART_START' });
      const response = await cartAPI.get();
      dispatch({
        type: 'CART_SUCCESS',
        payload: response.data.data,
      });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      dispatch({
        type: 'CART_FAILURE',
        payload: 'Failed to load cart',
      });
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: 'CART_START' });
      const response = await cartAPI.add(productId, quantity);
      dispatch({
        type: 'CART_SUCCESS',
        payload: response.data.data,
      });
      toast.success('Added to cart!');
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data || {};
      const message = errorData.error || 'Failed to add to cart';

      dispatch({
        type: 'CART_FAILURE',
        payload: message,
      });

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update cart item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      dispatch({ type: 'CART_START' });
      const response = await cartAPI.update(productId, quantity);
      dispatch({
        type: 'CART_SUCCESS',
        payload: response.data.data,
      });
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data || {};
      const message = errorData.error || 'Failed to update cart';

      dispatch({
        type: 'CART_FAILURE',
        payload: message,
      });

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: 'CART_START' });
      const response = await cartAPI.remove(productId);
      dispatch({
        type: 'CART_SUCCESS',
        payload: response.data.data,
      });
      toast.success('Removed from cart');
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data || {};
      const message = errorData.error || 'Failed to remove from cart';

      dispatch({
        type: 'CART_FAILURE',
        payload: message,
      });

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: 'CART_START' });
      const response = await cartAPI.clear();
      dispatch({
        type: 'CART_SUCCESS',
        payload: response.data.data,
      });
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data || {};
      const message = errorData.error || 'Failed to clear cart';

      dispatch({
        type: 'CART_FAILURE',
        payload: message,
      });

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Merge guest cart with user cart after login
  const mergeCart = async () => {
    const sessionId = getSessionId();
    try {
      await cartAPI.merge(sessionId);
      localStorage.removeItem('sessionId');
      await fetchCart();
    } catch (error) {
      console.error('Failed to merge cart:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    mergeCart,
    fetchCart,
    clearError,
    getSessionId,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};