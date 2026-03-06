export const notFoundHandler = (req, res, _next) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ message: "API route not found" });
    return;
  }

  res.status(404).send("Not Found");
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.statusCode || 500;
  const response = {
    message: error.message || "Internal Server Error",
  };

  if (process.env.NODE_ENV !== "production" && error.stack) {
    response.stack = error.stack;
  }

  if (req.path.startsWith("/api/")) {
    res.status(statusCode).json(response);
    return;
  }

  res.status(statusCode).send(response.message);
};
