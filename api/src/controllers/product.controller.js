import pool from "../config/db.js";

export const getProducts = async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        p.id,
        p.product_name,
        p.category,
        p.description,
        p.key_features,
        p.specifications,
        p.created_at,
        pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      ORDER BY p.id DESC, pi.id ASC`,
    );

    const productMap = new Map();

    for (const row of rows) {
      if (!productMap.has(row.id)) {
        productMap.set(row.id, {
          id: row.id,
          product_name: row.product_name,
          category: row.category,
          description: row.description,
          key_features: row.key_features,
          specifications: row.specifications,
          created_at: row.created_at,
          images: [],
        });
      }

      if (row.image_url) {
        productMap.get(row.id).images.push(row.image_url);
      }
    }

    res.status(200).json(Array.from(productMap.values()));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        p.id,
        p.product_name,
        p.category,
        p.description,
        p.key_features,
        p.specifications,
        p.created_at,
        pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE p.id = ?
      ORDER BY pi.id ASC`,
      [req.params.id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = {
      id: rows[0].id,
      product_name: rows[0].product_name,
      category: rows[0].category,
      description: rows[0].description,
      key_features: rows[0].key_features,
      specifications: rows[0].specifications,
      created_at: rows[0].created_at,
      images: [],
    };

    for (const row of rows) {
      if (row.image_url) {
        product.images.push(row.image_url);
      }
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  let connection;

  try {
    const {
      productName,
      category,
      description = null,
      keyFeatures = null,
      specifications = null,
      images = null,
    } = req.body;

    if (!productName || !category) {
      return res.status(400).json({ message: "productName and category are required" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO products
      (product_name, category, description, key_features, specifications)
      VALUES (?, ?, ?, ?, ?)`,
      [productName, category, description, keyFeatures, specifications],
    );

    const imageList = Array.isArray(images)
      ? images
      : images
        ? [images]
        : [];

    if (imageList.length) {
      const placeholders = imageList.map(() => "(?, ?)").join(", ");
      const values = imageList.flatMap((imageUrl) => [result.insertId, imageUrl]);

      await connection.execute(
        `INSERT INTO product_images (product_id, image_url) VALUES ${placeholders}`,
        values,
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Product created successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return res.status(500).json({ message: "Failed to create product", error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const updateProduct = async (req, res) => {
  let connection;

  try {
    const {
      productName,
      category,
      description = null,
      keyFeatures = null,
      specifications = null,
      images,
    } = req.body;

    if (!productName || !category) {
      return res.status(400).json({ message: "productName and category are required" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE products
      SET product_name = ?, category = ?, description = ?, key_features = ?, specifications = ?
      WHERE id = ?`,
      [productName, category, description, keyFeatures, specifications, req.params.id],
    );

    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    if (images !== undefined) {
      await connection.execute("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);

      const imageList = Array.isArray(images)
        ? images
        : images
          ? [images]
          : [];

      if (imageList.length) {
        const placeholders = imageList.map(() => "(?, ?)").join(", ");
        const values = imageList.flatMap((imageUrl) => [req.params.id, imageUrl]);

        await connection.execute(
          `INSERT INTO product_images (product_id, image_url) VALUES ${placeholders}`,
          values,
        );
      }
    }

    await connection.commit();

    return res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return res.status(500).json({ message: "Failed to update product", error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const deleteProduct = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
    const [result] = await connection.execute("DELETE FROM products WHERE id = ?", [req.params.id]);

    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    await connection.commit();

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return res.status(500).json({ message: "Failed to delete product", error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
