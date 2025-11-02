const { query } = require('../utils/database');

class Product {
  static async findAll(filters = {}) {
    let sql = `
      SELECT * FROM products
      WHERE is_active = true
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.mood_category) {
      sql += ` AND mood_category = $${paramIndex}`;
      params.push(filters.mood_category);
      paramIndex++;
    }

    if (filters.product_type) {
      sql += ` AND product_type = $${paramIndex}`;
      params.push(filters.product_type);
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

  static async findById(id) {
    const result = await query(
      'SELECT * FROM products WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(productData) {
    const {
      name,
      description,
      price,
      mood_category,
      product_type,
      size,
      burn_time,
      ingredient_list,
      stock_quantity,
      image_url
    } = productData;

    const result = await query(
      `INSERT INTO products (
        name, description, price, mood_category, product_type,
        size, burn_time, ingredient_list, stock_quantity, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name, description, price, mood_category, product_type,
        size, burn_time, ingredient_list, stock_quantity || 0, image_url
      ]
    );

    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const result = await query(
      `UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await query(
      'UPDATE products SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows[0] || null;
  }

  static async updateStock(id, quantity) {
    const result = await query(
      `UPDATE products
       SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING stock_quantity`,
      [quantity, id]
    );

    return result.rows[0];
  }

  static async checkStock(id, quantity) {
    const result = await query(
      'SELECT stock_quantity FROM products WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Product not found');
    }

    return result.rows[0].stock_quantity >= quantity;
  }
}

module.exports = Product;