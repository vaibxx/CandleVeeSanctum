const express = require('express');
const { query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all products with optional filtering
router.get('/', [
  query('mood_category').optional().isIn(['relaxing', 'energizing', 'romantic']).withMessage('Invalid mood category'),
  query('product_type').optional().isIn(['container', 'pillar', 'seasonal', 'gift_set']).withMessage('Invalid product type'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const filters = {};
    if (req.query.mood_category) filters.mood_category = req.query.mood_category;
    if (req.query.product_type) filters.product_type = req.query.product_type;
    if (req.query.limit) filters.limit = parseInt(req.query.limit);

    const products = await Product.findAll(filters);

    res.json({
      success: true,
      data: {
        products,
        count: products.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single product
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get featured products (home page)
router.get('/featured/list', async (req, res, next) => {
  try {
    const featuredProducts = await Product.findAll({ limit: 8 });

    res.json({
      success: true,
      data: {
        products: featuredProducts
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get products by mood category
router.get('/mood/:category', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res, next) => {
  try {
    const { category } = req.params;
    const validCategories = ['relaxing', 'energizing', 'romantic'];

    if (!validCategories.includes(category)) {
      const error = new Error('Invalid mood category');
      error.statusCode = 400;
      throw error;
    }

    const filters = { mood_category: category };
    if (req.query.limit) filters.limit = parseInt(req.query.limit);

    const products = await Product.findAll(filters);

    res.json({
      success: true,
      data: {
        products,
        category,
        count: products.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Search products
router.get('/search/query', [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const { q: searchQuery } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    // Simple text search - in production, consider using full-text search
    const products = await Product.findAll({
      limit,
      // Note: This is a simplified search. In production, you'd want:
      // - Full-text search with PostgreSQL tsvector
      // - Fuzzy matching
      // - Search scoring/ranking
      searchQuery: searchQuery.toLowerCase()
    });

    res.json({
      success: true,
      data: {
        products,
        query: searchQuery,
        count: products.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;