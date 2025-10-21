import type { ErrorRequestHandler, Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config.js";
import { AppError } from "../utils/app-error.js";
import { ZodError, z } from "zod";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { MulterError } from "multer";
import { HttpStatusCode } from "axios";

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};

const handleMulterError = (error: MulterError) => {
  const messages = {
    LIMIT_UNEXPECTED_FILE: "Invalid file field name. Please use 'file'",
    LIMIT_FILE_SIZE: "File size exceeds the limit",
    LIMIT_FILE_COUNT: "Too many files uploaded.",
    default: "File upload error",
  };

  return {
    status: HttpStatusCode.BadRequest,
    messages: messages[error.code as keyof typeof messages] || messages.default,
    error: error.message,
  };
};

export const errorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  console.log(`Error occured on PATH:`, req.path, "Error:", err);

  if (err instanceof ZodError) {
    return formatZodError(res, err);
  }

  if (err instanceof MulterError) {
    const { error, messages, status } = handleMulterError(err);

    return res
      .status(status)
      .json({ messages, error, errorCode: ErrorCodeEnum.FILE_UPLOAD_ERROR });
  }

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
