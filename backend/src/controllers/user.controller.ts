import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { findByIdUserService } from "../services/user.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await findByIdUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully.",
      user,
    });
  }
);
