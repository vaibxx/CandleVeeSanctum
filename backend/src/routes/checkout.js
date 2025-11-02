const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const ShoppingCart = require('../models/ShoppingCart');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Preview order with shipping rates and tax
router.post('/preview', optionalAuth, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('shipping_address').notEmpty().withMessage('Shipping address is required'),
  body('items.*.product_id').isUUID().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { items, shipping_address } = req.body;
    const userId = req.user ? req.user.id : null;

    // Calculate order total
    let subtotal = 0;
    const validItems = [];

    for (const item of items) {
      // Here we would verify product availability and get current prices
      // For now, we'll simulate this calculation
      subtotal += parseFloat(item.price || 0) * item.quantity;
      validItems.push(item);
    }

    // Calculate shipping (simplified - in production, integrate with carrier APIs)
    const shippingRates = await calculateShippingRates(shipping_address);
    const selectedShipping = shippingRates[0] || { cost: 0, method: 'Standard' };

    // Calculate tax (simplified - varies by location)
    const taxRate = 0.08; // 8% tax rate
    const tax = subtotal * taxRate;

    const total = subtotal + selectedShipping.cost + tax;

    res.json({
      success: true,
      data: {
        order_summary: {
          subtotal,
          shipping: selectedShipping.cost,
          tax,
          total,
          items: validItems
        },
        shipping_rates: shippingRates,
        selected_shipping: selectedShipping
      }
    });
  } catch (error) {
    next(error);
  }
});

// Process checkout and create order
router.post('/process', optionalAuth, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('shipping_address').notEmpty().withMessage('Shipping address is required'),
  body('billing_address').notEmpty().withMessage('Billing address is required'),
  body('payment_method').isIn(['stripe', 'paypal', 'square']).withMessage('Valid payment method required'),
  body('payment_intent_id').optional().isString().withMessage('Payment intent ID must be a string'),
  body('guest_email').optional().isEmail().withMessage('Valid guest email required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      items,
      shipping_address,
      billing_address,
      payment_method,
      payment_intent_id,
      guest_email
    } = req.body;

    const userId = req.user ? req.user.id : null;

    // Validate guest email for non-logged in users
    if (!userId && !guest_email) {
      const error = new Error('Guest email is required');
      error.statusCode = 400;
      throw error;
    }

    // Verify payment intent if provided (Stripe)
    if (payment_method === 'stripe' && payment_intent_id) {
      const paymentValid = await verifyStripePayment(payment_intent_id);
      if (!paymentValid) {
        const error = new Error('Payment verification failed');
        error.statusCode = 400;
        throw error;
      }
    }

    // Create order
    const order = await Order.create({
      user_id: userId,
      guest_email,
      items,
      shipping_address,
      billing_address,
      payment_method
    });

    // Update payment status if payment intent provided
    if (payment_intent_id) {
      await Order.updatePaymentStatus(order.id, 'completed', payment_intent_id);
    }

    // Get complete order details
    const orderDetails = await Order.findById(order.id);

    // TODO: Send order confirmation email
    console.log(`Order confirmation email sent for order ${order.id}`);

    res.status(201).json({
      success: true,
      data: {
        order: orderDetails
      },
      message: 'Order placed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Stripe payment intent creation
router.post('/create-payment-intent', optionalAuth, [
  body('amount').isFloat({ min: 0.50 }).withMessage('Amount must be at least $0.50'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { amount, currency = 'usd' } = req.body;

    // Create Stripe payment intent
    const paymentIntent = await createStripePaymentIntent(amount, currency);

    res.json({
      success: true,
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// PayPal order creation
router.post('/create-paypal-order', optionalAuth, [
  body('amount').isFloat({ min: 0.50 }).withMessage('Amount must be at least $0.50')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { amount } = req.body;

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(amount);

    res.json({
      success: true,
      data: {
        order_id: paypalOrder.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// PayPal order capture
router.post('/capture-paypal-order', optionalAuth, [
  body('order_id').notEmpty().withMessage('PayPal order ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { order_id } = req.body;

    // Capture PayPal payment
    const captureData = await capturePayPalOrder(order_id);

    res.json({
      success: true,
      data: {
        capture_id: captureData.id,
        status: captureData.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions (simplified implementations)
async function calculateShippingRates(address) {
  // In production, integrate with USPS, UPS, FedEx APIs
  const baseRate = 9.99;
  const weight = 16; // ounces (typical candle weight)

  return [
    {
      method: 'Standard',
      cost: baseRate,
      estimated_days: '3-5 business days',
      carrier: 'USPS'
    },
    {
      method: 'Express',
      cost: baseRate * 2,
      estimated_days: '1-2 business days',
      carrier: 'UPS'
    },
    {
      method: 'Overnight',
      cost: baseRate * 4,
      estimated_days: '1 business day',
      carrier: 'FedEx'
    }
  ];
}

async function createStripePaymentIntent(amount, currency) {
  // This would integrate with Stripe SDK
  // For now, return a mock response
  return {
    id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    client_secret: 'pi_test_' + Math.random().toString(36).substr(2, 9) + '_secret_' + Math.random().toString(36).substr(2, 9)
  };
}

async function verifyStripePayment(paymentIntentId) {
  // Verify payment with Stripe SDK
  // For now, return true
  return true;
}

async function createPayPalOrder(amount) {
  // This would integrate with PayPal SDK
  // For now, return a mock response
  return {
    id: 'PAYPAL-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  };
}

async function capturePayPalOrder(orderId) {
  // This would integrate with PayPal SDK
  // For now, return a mock response
  return {
    id: 'CAPTURE-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    status: 'COMPLETED'
  };
}

module.exports = router;