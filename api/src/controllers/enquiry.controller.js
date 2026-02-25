import pool from "../config/db.js";

const getMessagesColumnMap = async () => {
  const [columnRows] = await pool.execute("SHOW COLUMNS FROM messages");
  const availableColumns = new Set(columnRows.map((col) => col.Field));
  const pickColumn = (candidates) => candidates.find((col) => availableColumns.has(col)) || null;

  return {
    id: pickColumn(["id", "message_id"]),
    name: pickColumn(["name", "fullname", "full_name"]),
    email: pickColumn(["email", "customer_email"]),
    phone: pickColumn(["phone", "phone_number", "customer_phone"]),
    subject: pickColumn(["subject", "title"]),
    message: pickColumn(["message", "content", "body"]),
    status: pickColumn(["status"]),
    created_at: pickColumn(["created_at", "date_created"]),
  };
};

export const getServiceEnquiries = async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id,
        service AS service_name,
        fullname AS name,
        email,
        phone,
        budget_range,
        expected_timeline,
        message,
        created_at
      FROM service_enquiries
      ORDER BY created_at DESC`,
    );

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch service enquiries",
      error: error.message,
    });
  }
};

export const createServiceEnquiry = async (req, res) => {
  try {
    const {
      service_name,
      name,
      email,
      phone,
      company = null,
      message,
      budget_range = null,
      timeline = null,
    } = req.body;

    if (!service_name || !name || !email || !phone || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [columnRows] = await pool.execute("SHOW COLUMNS FROM service_enquiries");
    const availableColumns = new Set(columnRows.map((col) => col.Field));

    const pickColumn = (candidates) => candidates.find((col) => availableColumns.has(col)) || null;

    const columnMap = {
      service_name: pickColumn(["service_name", "service", "service_title"]),
      name: pickColumn(["name", "fullname", "customer_name", "full_name"]),
      email: pickColumn(["email", "customer_email"]),
      phone: pickColumn(["phone", "phone_number", "customer_phone"]),
      message: pickColumn(["message", "inquiry_message", "details"]),
      company: pickColumn(["company", "company_name"]),
      budget_range: pickColumn(["budget_range", "budget"]),
      timeline: pickColumn(["timeline", "expected_timeline"]),
    };

    if (!columnMap.service_name || !columnMap.name || !columnMap.email || !columnMap.phone || !columnMap.message) {
      return res.status(500).json({
        message: "service_enquiries table is missing required columns",
      });
    }

    const payloadByColumn = {
      [columnMap.service_name]: service_name,
      [columnMap.name]: name,
      [columnMap.email]: email,
      [columnMap.phone]: phone,
      [columnMap.message]: message,
      ...(columnMap.company ? { [columnMap.company]: company } : {}),
      ...(columnMap.budget_range ? { [columnMap.budget_range]: budget_range } : {}),
      ...(columnMap.timeline ? { [columnMap.timeline]: timeline } : {}),
    };

    const insertColumns = Object.keys(payloadByColumn);
    const values = insertColumns.map((key) => {
      const value = payloadByColumn[key];
      return value === "" ? null : value;
    });

    const placeholders = insertColumns.map(() => "?").join(", ");

    const [result] = await pool.execute(
      `INSERT INTO service_enquiries
      (${insertColumns.join(", ")})
      VALUES (${placeholders})`,
      values,
    );

    return res.status(201).json({
      message: "Service enquiry submitted successfully",
      id: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit service enquiry",
      error: error.message,
    });
  }
};

export const createContactMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      phone = null,
      subject,
      message,
    } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const columnMap = await getMessagesColumnMap();

    if (!columnMap.name || !columnMap.email || !columnMap.subject || !columnMap.message) {
      return res.status(500).json({ message: "messages table is missing required columns" });
    }

    const payloadByColumn = {
      [columnMap.name]: name,
      [columnMap.email]: email,
      [columnMap.subject]: subject,
      [columnMap.message]: message,
      ...(columnMap.phone ? { [columnMap.phone]: phone } : {}),
      ...(columnMap.status ? { [columnMap.status]: "unread" } : {}),
    };

    const insertColumns = Object.keys(payloadByColumn);
    const values = insertColumns.map((key) => {
      const value = payloadByColumn[key];
      return value === "" ? null : value;
    });
    const placeholders = insertColumns.map(() => "?").join(", ");

    const [result] = await pool.execute(
      `INSERT INTO messages (${insertColumns.join(", ")}) VALUES (${placeholders})`,
      values,
    );

    return res.status(201).json({
      message: "Message submitted successfully",
      id: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit message",
      error: error.message,
    });
  }
};

export const getContactMessages = async (_req, res) => {
  try {
    const columnMap = await getMessagesColumnMap();

    if (!columnMap.id || !columnMap.name || !columnMap.email || !columnMap.subject || !columnMap.message) {
      return res.status(500).json({ message: "messages table is missing required columns" });
    }

    const selectCreatedAt = columnMap.created_at
      ? `${columnMap.created_at} AS created_at`
      : "NULL AS created_at";
    const selectStatus = columnMap.status
      ? `${columnMap.status} AS status`
      : "'unread' AS status";
    const selectPhone = columnMap.phone
      ? `${columnMap.phone} AS phone`
      : "NULL AS phone";
    const orderBy = columnMap.created_at
      ? `${columnMap.created_at} DESC`
      : `${columnMap.id} DESC`;

    const [rows] = await pool.execute(
      `SELECT
        ${columnMap.id} AS id,
        ${columnMap.name} AS name,
        ${columnMap.email} AS email,
        ${selectPhone},
        ${columnMap.subject} AS subject,
        ${columnMap.message} AS message,
        ${selectStatus},
        ${selectCreatedAt}
      FROM messages
      ORDER BY ${orderBy}`,
    );

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

export const updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["unread", "read", "replied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const columnMap = await getMessagesColumnMap();
    if (!columnMap.id || !columnMap.status) {
      return res.status(200).json({
        message: "Status update skipped: messages table has no status column",
      });
    }

    const [result] = await pool.execute(
      `UPDATE messages SET ${columnMap.status} = ? WHERE ${columnMap.id} = ?`,
      [status, req.params.id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json({ message: "Message status updated successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update message",
      error: error.message,
    });
  }
};

export const deleteContactMessage = async (req, res) => {
  try {
    const columnMap = await getMessagesColumnMap();
    if (!columnMap.id) {
      return res.status(500).json({ message: "messages table is missing id column" });
    }

    const [result] = await pool.execute(`DELETE FROM messages WHERE ${columnMap.id} = ?`, [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

export const deleteServiceEnquiry = async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM service_enquiries WHERE id = ?", [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Service enquiry not found" });
    }

    return res.status(200).json({ message: "Service enquiry deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete service enquiry",
      error: error.message,
    });
  }
};
