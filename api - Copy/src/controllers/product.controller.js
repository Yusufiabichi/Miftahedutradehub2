import pool from "../config/db.js";

let schemaInfoPromise = null;

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

const parseStoredArray = (value) => {
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

const jsonValueOrNull = (arrayValue) => {
  const list = toStringArray(arrayValue);
  return list.length ? JSON.stringify(list) : null;
};

const textValueOrNull = (arrayValue) => {
  const list = toStringArray(arrayValue);
  return list.length ? list.join(", ") : null;
};

const getSchemaInfo = async () => {
  if (!schemaInfoPromise) {
    schemaInfoPromise = (async () => {
      // Avoid information_schema because many shared hosts restrict it.
      const [, fields] = await pool.execute("SELECT * FROM products LIMIT 0");
      const columns = new Set(fields.map((field) => field.name));

      let hasProductImagesTable = false;
      try {
        await pool.execute("SELECT 1 FROM product_images LIMIT 1");
        hasProductImagesTable = true;
      } catch {
        hasProductImagesTable = false;
      }

      return {
        columns,
        hasProductImagesTable,
      };
    })();
  }

  return schemaInfoPromise;
};

const resolveColumn = (columns, options) => options.find((column) => columns.has(column)) || null;

const buildSelectQuery = (columns, whereClause = "") => {
  const nameColumn = resolveColumn(columns, ["name", "product_name"]);
  const featuresColumn = resolveColumn(columns, ["features", "key_features"]);
  const specificationsColumn = columns.has("specifications") ? "specifications" : null;
  const imagesColumn = columns.has("images") ? "images" : null;
  const imageColumn = columns.has("image") ? "image" : null;
  const createdAtColumn = columns.has("created_at") ? "created_at" : null;

  return `
    SELECT
      id,
      ${nameColumn ? `${nameColumn} AS product_name` : "NULL AS product_name"},
      ${columns.has("category") ? "category" : "NULL AS category"},
      ${columns.has("description") ? "description" : "NULL AS description"},
      ${featuresColumn ? `${featuresColumn} AS key_features` : "NULL AS key_features"},
      ${specificationsColumn ? `${specificationsColumn} AS specifications` : "NULL AS specifications"},
      ${imagesColumn ? `${imagesColumn} AS images` : "NULL AS images"},
      ${imageColumn ? `${imageColumn} AS image` : "NULL AS image"},
      ${createdAtColumn ? `${createdAtColumn} AS created_at` : "NULL AS created_at"}
    FROM products
    ${whereClause}
  `;
};

const mapProductRow = (row, imageMap = null) => {
  const parsedImages = parseStoredArray(row.images);
  const fallbackImagesFromMap = imageMap ? imageMap.get(row.id) || [] : [];
  const singleImage = row.image ? [String(row.image)] : [];
  const images = parsedImages.length ? parsedImages : (fallbackImagesFromMap.length ? fallbackImagesFromMap : singleImage);

  return {
    id: row.id,
    product_name: row.product_name || "",
    category: row.category || "",
    description: row.description || "",
    key_features: parseStoredArray(row.key_features).join(", "),
    specifications: parseStoredArray(row.specifications).join(", "),
    created_at: row.created_at,
    images,
  };
};

const loadProductImageMap = async () => {
  const [rows] = await pool.execute(
    `SELECT product_id, image_url
     FROM product_images
     ORDER BY id ASC`,
  );

  const imageMap = new Map();
  for (const row of rows) {
    if (!imageMap.has(row.product_id)) {
      imageMap.set(row.product_id, []);
    }
    if (row.image_url) {
      imageMap.get(row.product_id).push(String(row.image_url));
    }
  }
  return imageMap;
};

export const getProducts = async (_req, res) => {
  try {
    const { columns, hasProductImagesTable } = await getSchemaInfo();
    const [rows] = await pool.execute(`${buildSelectQuery(columns, "ORDER BY id DESC")}`);

    const shouldLoadImageTable = hasProductImagesTable && !columns.has("images");
    const imageMap = shouldLoadImageTable ? await loadProductImageMap() : null;

    return res.status(200).json(rows.map((row) => mapProductRow(row, imageMap)));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { columns, hasProductImagesTable } = await getSchemaInfo();
    const [rows] = await pool.execute(buildSelectQuery(columns, "WHERE id = ? LIMIT 1"), [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageMap = null;
    if (hasProductImagesTable && !columns.has("images")) {
      imageMap = await loadProductImageMap();
    }

    return res.status(200).json(mapProductRow(rows[0], imageMap));
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

    const { columns } = await getSchemaInfo();

    const nameColumn = resolveColumn(columns, ["name", "product_name"]);
    if (!nameColumn) {
      return res.status(500).json({ message: "Products table missing name/product_name column" });
    }

    const payload = new Map();
    payload.set(nameColumn, productName);
    if (columns.has("category")) payload.set("category", category);
    if (columns.has("description")) payload.set("description", description || "");
    if (columns.has("features")) payload.set("features", jsonValueOrNull(keyFeatures));
    if (columns.has("key_features")) payload.set("key_features", textValueOrNull(keyFeatures));
    if (columns.has("specifications")) {
      payload.set(
        "specifications",
        columns.has("features") ? jsonValueOrNull(specifications) : textValueOrNull(specifications),
      );
    }
    if (columns.has("images")) payload.set("images", jsonValueOrNull(images));
    if (columns.has("image")) {
      const list = toStringArray(images);
      payload.set("image", list[0] || null);
    }

    const columnsList = Array.from(payload.keys());
    const values = Array.from(payload.values());
    const placeholders = columnsList.map(() => "?").join(", ");

    const [result] = await pool.execute(
      `INSERT INTO products (${columnsList.join(", ")}) VALUES (${placeholders})`,
      values,
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
      images = null,
    } = req.body;

    if (!productName || !category) {
      return res.status(400).json({ message: "productName and category are required" });
    }

    const { columns } = await getSchemaInfo();

    const nameColumn = resolveColumn(columns, ["name", "product_name"]);
    if (!nameColumn) {
      return res.status(500).json({ message: "Products table missing name/product_name column" });
    }

    const updateMap = new Map();
    updateMap.set(nameColumn, productName);
    if (columns.has("category")) updateMap.set("category", category);
    if (columns.has("description")) updateMap.set("description", description || "");
    if (columns.has("features")) updateMap.set("features", jsonValueOrNull(keyFeatures));
    if (columns.has("key_features")) updateMap.set("key_features", textValueOrNull(keyFeatures));
    if (columns.has("specifications")) {
      updateMap.set(
        "specifications",
        columns.has("features") ? jsonValueOrNull(specifications) : textValueOrNull(specifications),
      );
    }
    if (columns.has("images")) updateMap.set("images", jsonValueOrNull(images));
    if (columns.has("image")) {
      const list = toStringArray(images);
      updateMap.set("image", list[0] || null);
    }

    const setClause = Array.from(updateMap.keys()).map((column) => `${column} = ?`).join(", ");
    const values = [...Array.from(updateMap.values()), req.params.id];

    const [result] = await pool.execute(
      `UPDATE products SET ${setClause} WHERE id = ?`,
      values,
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
    const { hasProductImagesTable } = await getSchemaInfo();

    if (hasProductImagesTable) {
      await pool.execute("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
    }

    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};
