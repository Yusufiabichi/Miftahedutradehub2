import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

export const createAccessToken = (user) => jwt.sign(
  {
    sub: String(user.id),
    email: user.email,
    role: user.role,
  },
  getJwtSecret(),
  { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
);

export const verifyAccessToken = (token) => jwt.verify(token, getJwtSecret());