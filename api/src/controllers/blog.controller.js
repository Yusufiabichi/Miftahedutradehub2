import pool from "../config/db.js";

const parseTags = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  const raw = String(value).trim();
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag).trim()).filter(Boolean);
      }
    } catch {
      // Fall back to comma split.
    }
  }

  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const formatBlog = (row) => ({
  id: row.id,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  author: row.author,
  category: row.category,
  image: row.image,
  tags: parseTags(row.tags),
  read_time: row.read_time,
  status: row.status,
  is_published: row.status === "Published",
  published_at: null,
  created_at: row.created_at,
});

export const getBlogs = async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        b.id,
        b.title,
        b.excerpt,
        b.content,
        b.author,
        b.category,
        b.image,
        bt.tags,
        b.read_time,
        b.status,
        b.created_at
      FROM blogs b
      LEFT JOIN blog_tags bt ON bt.blog_id = b.id
      ORDER BY b.created_at DESC`,
    );

    return res.status(200).json(rows.map(formatBlog));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch blogs", error: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        b.id,
        b.title,
        b.excerpt,
        b.content,
        b.author,
        b.category,
        b.image,
        bt.tags,
        b.read_time,
        b.status,
        b.created_at
      FROM blogs b
      LEFT JOIN blog_tags bt ON bt.blog_id = b.id
      WHERE b.id = ?
      LIMIT 1`,
      [req.params.id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json(formatBlog(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch blog", error: error.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      category,
      image,
      tags = [],
      read_time = null,
      status,
      is_published = false,
    } = req.body;

    if (!title || !excerpt || !content || !author || !category || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedTags = parseTags(tags);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const resolvedStatus = status || (is_published ? "Published" : "Draft");

      const [result] = await connection.execute(
        `INSERT INTO blogs
        (title, excerpt, content, author, category, image, read_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          excerpt,
          content,
          author,
          category,
          image,
          read_time,
          resolvedStatus,
        ],
      );

      const blogId = result.insertId;

      const tagsValue = normalizedTags.join(",");
      await connection.execute(
        `INSERT INTO blog_tags (blog_id, tags)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE tags = VALUES(tags)`,
        [blogId, tagsValue],
      );

      await connection.commit();
      return res.status(201).json({ message: "Blog created successfully", id: blogId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to create blog", error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      category,
      image,
      tags = [],
      read_time = null,
      status,
      is_published = false,
    } = req.body;

    if (!title || !excerpt || !content || !author || !category || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedTags = parseTags(tags);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const resolvedStatus = status || (is_published ? "Published" : "Draft");

      const [result] = await connection.execute(
        `UPDATE blogs
        SET
          title = ?,
          excerpt = ?,
          content = ?,
          author = ?,
          category = ?,
          image = ?,
          read_time = ?,
          status = ?
        WHERE id = ?`,
        [
          title,
          excerpt,
          content,
          author,
          category,
          image,
          read_time,
          resolvedStatus,
          req.params.id,
        ],
      );

      if (!result.affectedRows) {
        await connection.rollback();
        return res.status(404).json({ message: "Blog not found" });
      }

      const tagsValue = normalizedTags.join(",");
      await connection.execute(
        `INSERT INTO blog_tags (blog_id, tags)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE tags = VALUES(tags)`,
        [req.params.id, tagsValue],
      );

      await connection.commit();
      return res.status(200).json({ message: "Blog updated successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to update blog", error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute("DELETE FROM blog_tags WHERE blog_id = ?", [req.params.id]);
      const [result] = await connection.execute("DELETE FROM blogs WHERE id = ?", [req.params.id]);

      if (!result.affectedRows) {
        await connection.rollback();
        return res.status(404).json({ message: "Blog not found" });
      }

      await connection.commit();
      return res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete blog", error: error.message });
  }
};
