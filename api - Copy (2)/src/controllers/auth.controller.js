import bcrypt from "bcryptjs";
import { createAccessToken } from "../config/auth.config.js";
import { findActiveAdminByEmail } from "../db/auth.queries.js";

export const login = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await findActiveAdminByEmail(email);
    const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !passwordMatches) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.status(200).json({
      token: createAccessToken(user),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Auth] Login failed:", error.message);
    res.status(500).json({ message: "Unable to complete login" });
  }
};

export const getCurrentUser = (req, res) => {
  res.status(200).json({ user: req.user });
};