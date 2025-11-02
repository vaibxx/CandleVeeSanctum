const { query, transaction } = require('../utils/database');
const Product = require('./Product');

class Order {
  static async create(orderData) {
    const {
      user_id,
      guest_email,
      items,
      shipping_address,
      billing_address,
      payment_method
    } = orderData;

    return await transaction(async (client) => {
      // Calculate total and check stock
      let total_amount = 0;
      const orderItems = [];

      for (const item of items) {
        const productResult = await client.query(
          'SELECT * FROM products WHERE id = $1 AND is_active = true',
          [item.product_id]
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        const product = productResult.rows[0];

        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        total_amount += itemTotal;

        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price
        });
      }

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (
          user_id, guest_email, total_amount, shipping_address,
          billing_address, payment_method
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          user_id || null,
          guest_email,
          total_amount,
          JSON.stringify(shipping_address),
          JSON.stringify(billing_address),
          payment_method
        ]
      );

      const order = orderResult.rows[0];

      // Create order items and update stock
      for (const item of orderItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.product_id, item.quantity, item.unit_price]
        );

        // Update product stock
        await client.query(
          `UPDATE products
           SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // Clear shopping cart if user is logged in
      if (user_id) {
        await client.query('DELETE FROM shopping_cart WHERE user_id = $1', [user_id]);
      }

      return order;
    });
  }

  static async findById(id) {
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;
    return order;
  }

  static async findByUserId(userId) {
    const ordersResult = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    for (const order of ordersResult.rows) {
      const itemsResult = await query(
        `SELECT oi.*, p.name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    return ordersResult.rows;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM orders';
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      sql += ` WHERE status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await query(sql, params);
    return result.rows;
  }

  static async updateStatus(id, status, tracking_number = null) {
    const result = await query(
      `UPDATE orders
       SET status = $1,
           tracking_number = COALESCE($2, tracking_number),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, tracking_number, id]
    );

    return result.rows[0] || null;
  }

  static async updatePaymentStatus(id, payment_status, payment_intent_id = null) {
    const result = await query(
      `UPDATE orders
       SET payment_status = $1,
           payment_intent_id = COALESCE($2, payment_intent_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [payment_status, payment_intent_id, id]
    );

    return result.rows[0] || null;
  }

  static async getOrdersByDateRange(startDate, endDate) {
    const result = await query(
      `SELECT * FROM orders
       WHERE created_at BETWEEN $1 AND $2
       ORDER BY created_at DESC`,
      [startDate, endDate]
    );

    return result.rows;
  }

  static async getOrderStats() {
    const result = await query(`
      SELECT
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN total_amount END), 0) as total_revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);

    return result.rows[0];
  }
}

module.exports = Order;