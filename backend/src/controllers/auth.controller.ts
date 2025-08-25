import type { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { loginService, registerService } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);

  const result = await registerService(body);

  return res
    .status(HTTPSTATUS.CREATED)
    .json({ message: "User Registered Successfully.", data: result });
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse({
    ...req.body,
  });

  const { accessToken, expiresAt, reportSetting, user } = await loginService(body);

  return res.status(HTTPSTATUS.OK).json({
    message: "User logged in successfully.",
    accessToken,
    expiresAt,
    reportSetting,
    user,
  });
});
