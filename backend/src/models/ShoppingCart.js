const { query } = require('../utils/database');
const Product = require('./Product');

class ShoppingCart {
  static async getCart(userId = null, sessionId = null) {
    if (!userId && !sessionId) {
      return { items: [], total: 0 };
    }

    let sql = `
      SELECT sc.*, p.name, p.price, p.image_url, p.stock_quantity, p.is_active
      FROM shopping_cart sc
      JOIN products p ON sc.product_id = p.id
      WHERE
    `;

    const params = [];

    if (userId) {
      sql += ' sc.user_id = $1';
      params.push(userId);
    } else {
      sql += ' sc.session_id = $1';
      params.push(sessionId);
    }

    sql += ' ORDER BY sc.created_at';

    const result = await query(sql, params);

    const items = result.rows.filter(item => item.is_active && item.stock_quantity > 0);
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    return { items, total };
  }

  static async addItem(userId, sessionId, productId, quantity = 1) {
    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if product is in stock
    if (product.stock_quantity < quantity) {
      const error = new Error('Insufficient stock');
      error.statusCode = 400;
      throw error;
    }

    // Check if item already exists in cart
    let existingItem;
    if (userId) {
      const result = await query(
        'SELECT * FROM shopping_cart WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      existingItem = result.rows[0];
    } else {
      const result = await query(
        'SELECT * FROM shopping_cart WHERE session_id = $1 AND product_id = $2',
        [sessionId, productId]
      );
      existingItem = result.rows[0];
    }

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        const error = new Error('Insufficient stock');
        error.statusCode = 400;
        throw error;
      }

      if (userId) {
        await query(
          'UPDATE shopping_cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3',
          [newQuantity, userId, productId]
        );
      } else {
        await query(
          'UPDATE shopping_cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2 AND product_id = $3',
          [newQuantity, sessionId, productId]
        );
      }
    } else {
      // Add new item
      if (userId) {
        await query(
          'INSERT INTO shopping_cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
          [userId, productId, quantity]
        );
      } else {
        await query(
          'INSERT INTO shopping_cart (session_id, product_id, quantity) VALUES ($1, $2, $3)',
          [sessionId, productId, quantity]
        );
      }
    }

    return await this.getCart(userId, sessionId);
  }

  static async updateItemQuantity(userId, sessionId, productId, quantity) {
    if (quantity <= 0) {
      return await this.removeItem(userId, sessionId, productId);
    }

    // Check if product has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (product.stock_quantity < quantity) {
      const error = new Error('Insufficient stock');
      error.statusCode = 400;
      throw error;
    }

    if (userId) {
      await query(
        'UPDATE shopping_cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3',
        [quantity, userId, productId]
      );
    } else {
      await query(
        'UPDATE shopping_cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2 AND product_id = $3',
        [quantity, sessionId, productId]
      );
    }

    return await this.getCart(userId, sessionId);
  }

  static async removeItem(userId, sessionId, productId) {
    if (userId) {
      await query('DELETE FROM shopping_cart WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    } else {
      await query('DELETE FROM shopping_cart WHERE session_id = $1 AND product_id = $2', [sessionId, productId]);
    }

    return await this.getCart(userId, sessionId);
  }

  static async clearCart(userId, sessionId) {
    if (userId) {
      await query('DELETE FROM shopping_cart WHERE user_id = $1', [userId]);
    } else if (sessionId) {
      await query('DELETE FROM shopping_cart WHERE session_id = $1', [sessionId]);
    }

    return { items: [], total: 0 };
  }

  static async mergeGuestCart(sessionId, userId) {
    const guestCart = await query(
      'SELECT * FROM shopping_cart WHERE session_id = $1',
      [sessionId]
    );

    if (guestCart.rows.length === 0) {
      return;
    }

    for (const item of guestCart.rows) {
      // Check if user already has this item in cart
      const existingItem = await query(
        'SELECT * FROM shopping_cart WHERE user_id = $1 AND product_id = $2',
        [userId, item.product_id]
      );

      if (existingItem.rows.length > 0) {
        // Update quantity
        await query(
          'UPDATE shopping_cart SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3',
          [item.quantity, userId, item.product_id]
        );
      } else {
        // Move item to user cart
        await query(
          'UPDATE shopping_cart SET user_id = $1, session_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [userId, item.id]
        );
      }
    }
  }

  static async getCartCount(userId = null, sessionId = null) {
    if (!userId && !sessionId) {
      return 0;
    }

    let sql = 'SELECT SUM(quantity) as count FROM shopping_cart WHERE';
    const params = [];

    if (userId) {
      sql += ' user_id = $1';
      params.push(userId);
    } else {
      sql += ' session_id = $1';
      params.push(sessionId);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count) || 0;
  }
}

module.exports = ShoppingCart;