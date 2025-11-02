const express = require('express');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's order history
router.get('/', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findByUserId(userId);

    res.json({
      success: true,
      data: {
        orders,
        count: orders.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific order details
router.get('/:id', auth, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await Order.findById(orderId);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if order belongs to user or user is admin
    if (order.user_id !== userId && !req.user.is_admin) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
});

// Track order (public endpoint with order ID)
router.get('/:id/track', async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { email } = req.query;

    const order = await Order.findById(orderId);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify email for security
    const orderEmail = order.user_id ? null : order.guest_email;
    if (orderEmail && orderEmail !== email) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Return limited tracking information
    const trackingInfo = {
      id: order.id,
      status: order.status,
      tracking_number: order.tracking_number,
      created_at: order.created_at,
      estimated_delivery: order.estimated_delivery
    };

    res.json({
      success: true,
      data: {
        order: trackingInfo
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;