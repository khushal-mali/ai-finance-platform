import type { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../config/http.config.js";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  console.log(`Error occured on PATH:`, req.path);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error.",
    error: err?.message || "Unknown error occured.",
  });
};
