const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    console.error(err);

    if (err.name === "CastError") {
      error = new Error("Resource not found");
      error.statusCode = 404;
    }

    if (err.code === 11000) {
      error = new Error("Duplicate field value entered");
      error.statusCode = 400;
    }

    if (err.code === "23505") {
      error = new Error("Duplicate field value entered");
      error.statusCode = 400;
    }

    if (err.code === "23502" || err.code === "23503") {
      error = new Error(err.message || "Invalid or missing value");
      error.statusCode = 400;
    }

    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      error = new Error(message.join(", "));
      error.statusCode = 400;
    }

    res
      .status(error.statusCode || 500)
      .json({ success: false, error: error.message || "Server Error" });
  } catch (e) {
    next(e);
  }
};

export default errorMiddleware;
