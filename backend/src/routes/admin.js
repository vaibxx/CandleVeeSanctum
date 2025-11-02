const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard stats
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const stats = await Order.getOrderStats();

    // Get additional product stats
    const productStats = await Product.findAll();
    const activeProducts = productStats.filter(p => p.is_active).length;
    const totalStock = productStats.reduce((sum, p) => sum + p.stock_quantity, 0);

    const dashboardStats = {
      ...stats,
      active_products: activeProducts,
      total_products: productStats.length,
      total_stock: totalStock
    };

    res.json({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    next(error);
  }
});

// Product Management
router.get('/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, mood_category, product_type } = req.query;

    const filters = {};
    if (mood_category) filters.mood_category = mood_category;
    if (product_type) filters.product_type = product_type;

    const products = await Product.findAll(filters);

    res.json({
      success: true,
      data: {
        products,
        count: products.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/products', [
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('mood_category').isIn(['relaxing', 'energizing', 'romantic']).withMessage('Valid mood category required'),
  body('product_type').isIn(['container', 'pillar', 'seasonal', 'gift_set']).withMessage('Valid product type required'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be non-negative')
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

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        product
      },
      message: 'Product created successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/products/:id', [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be non-negative')
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

    const product = await Product.update(req.params.id, req.body);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: {
        product
      },
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.delete(req.params.id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Order Management
router.get('/orders', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const orders = await Order.findAll(filters);

    res.json({
      success: true,
      data: {
        orders,
        count: orders.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
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

router.put('/orders/:id/status', [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status required'),
  body('tracking_number').optional().isString().withMessage('Tracking number must be a string')
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

    const { status, tracking_number } = req.body;
    const order = await Order.updateStatus(req.params.id, status, tracking_number);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // TODO: Send shipping notification email
    console.log(`Order ${order.id} status updated to ${status}`);

    res.json({
      success: true,
      data: {
        order
      },
      message: 'Order status updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Low stock alerts
router.get('/products/low-stock', async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const allProducts = await Product.findAll();
    const lowStockProducts = allProducts.filter(p => p.stock_quantity <= threshold);

    res.json({
      success: true,
      data: {
        products: lowStockProducts,
        threshold,
        count: lowStockProducts.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Sales analytics
router.get('/analytics/sales', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let orders;
    if (start_date && end_date) {
      orders = await Order.getOrdersByDateRange(start_date, end_date);
    } else {
      orders = await Order.findAll();
    }

    // Calculate analytics
    const totalRevenue = orders
      .filter(o => o.payment_status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const dailySales = orders.reduce((acc, order) => {
      const date = order.created_at.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + parseFloat(order.total_amount);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total_revenue: totalRevenue,
        total_orders: orders.length,
        orders_by_status: ordersByStatus,
        daily_sales: dailySales,
        period: {
          start_date: start_date || null,
          end_date: end_date || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;