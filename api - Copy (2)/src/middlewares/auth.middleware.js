import { verifyAccessToken } from "../config/auth.config.js";

export const requireAuth = (req, res, next) => {
	const authorization = req.headers.authorization || "";
	const [scheme, token] = authorization.split(" ");

	if (scheme !== "Bearer" || !token) {
		res.status(401).json({ message: "Authentication required" });
		return;
	}

	try {
		req.user = verifyAccessToken(token);
		next();
	} catch {
		res.status(401).json({ message: "Invalid or expired token" });
	}
};
