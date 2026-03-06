import pool from "../config/db.js";

const toStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value == null) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item).trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const parseStoredJsonArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const mapProductRow = (row) => {
  const features = parseStoredJsonArray(row.features);
  const specifications = parseStoredJsonArray(row.specifications);
  const images = parseStoredJsonArray(row.images);

  return {
    id: row.id,
    product_name: row.name,
    category: row.category,
    description: row.description,
    key_features: features.join(", "),
    specifications: specifications.join(", "),
    created_at: row.created_at,
    images,
  };
};

export const getProducts = async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id,
        name,
        category,
        description,
        features,
        specifications,
        images,
        created_at
      FROM products
      ORDER BY id DESC`,
    );

    res.status(200).json(rows.map(mapProductRow));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id,
        name,
        category,
        description,
        features,
        specifications,
        images,
        created_at
      FROM products
      WHERE id = ?`,
      [req.params.id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(mapProductRow(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

export const createProduct = async (req, res) => {
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

    const featureList = toStringArray(keyFeatures);
    const specificationList = toStringArray(specifications);
    const imageList = toStringArray(images);

    const [result] = await pool.execute(
      `INSERT INTO products
      (name, category, description, features, specifications, images)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        productName,
        category,
        description,
        featureList.length ? JSON.stringify(featureList) : null,
        specificationList.length ? JSON.stringify(specificationList) : null,
        imageList.length ? JSON.stringify(imageList) : null,
      ],
    );

    return res.status(201).json({
      message: "Product created successfully",
      id: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
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

    const featureList = toStringArray(keyFeatures);
    const specificationList = toStringArray(specifications);
    const imageList = toStringArray(images);

    const [result] = await pool.execute(
      `UPDATE products
      SET name = ?, category = ?, description = ?, features = ?, specifications = ?, images = ?
      WHERE id = ?`,
      [
        productName,
        category,
        description,
        featureList.length ? JSON.stringify(featureList) : null,
        specificationList.length ? JSON.stringify(specificationList) : null,
        imageList.length ? JSON.stringify(imageList) : null,
        req.params.id,
      ],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};
