const express = require('express');
const { body, validationResult } = require('express-validator');
const ShoppingCart = require('../models/ShoppingCart');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get cart contents
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || null;

    const cart = await ShoppingCart.getCart(userId, sessionId);

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/add', [
  body('product_id').isUUID().withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
], optionalAuth, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { product_id, quantity } = req.body;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || null;

    if (!userId && !sessionId) {
      const error = new Error('Session ID required for guest carts');
      error.statusCode = 400;
      throw error;
    }

    const cart = await ShoppingCart.addItem(userId, sessionId, product_id, quantity);

    res.json({
      success: true,
      data: cart,
      message: 'Item added to cart'
    });
  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/update', [
  body('product_id').isUUID().withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 0, max: 99 }).withMessage('Quantity must be between 0 and 99')
], optionalAuth, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { product_id, quantity } = req.body;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || null;

    if (!userId && !sessionId) {
      const error = new Error('Session ID required for guest carts');
      error.statusCode = 400;
      throw error;
    }

    const cart = await ShoppingCart.updateItemQuantity(userId, sessionId, product_id, quantity);

    res.json({
      success: true,
      data: cart,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated'
    });
  } catch (error) {
    next(error);
  }
});

// Remove item from cart
router.delete('/remove/:productId', optionalAuth, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || null;

    if (!userId && !sessionId) {
      const error = new Error('Session ID required for guest carts');
      error.statusCode = 400;
      throw error;
    }

    const cart = await ShoppingCart.removeItem(userId, sessionId, productId);

    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.headers['x-session-id'] || null;

    const cart = await ShoppingCart.clearCart(userId, sessionId);

    res.json({
      success: true,
      data: cart,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
});

// Get cart count (for header badge)
router.get('/count', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || null;

    const count = await ShoppingCart.getCartCount(userId, sessionId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
});

// Merge guest cart with user cart (after login)
router.post('/merge', auth, async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      const error = new Error('Session ID required');
      error.statusCode = 400;
      throw error;
    }

    await ShoppingCart.mergeGuestCart(sessionId, userId);

    const cart = await ShoppingCart.getCart(userId, null);

    res.json({
      success: true,
      data: cart,
      message: 'Cart merged successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;