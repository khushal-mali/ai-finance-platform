import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import {
  generateReportService,
  getAllReportsService,
  updateReportsSettingService,
} from "../services/report.service.js";
import { updateReportSettingSchema } from "../validators/report.validator.js";

export const getAllReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req?.user?._id;

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 20,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const result = await getAllReportsService(userId, pagination);

    return res.status(HttpStatusCode.Ok).json({
      message: "Reports history fetched successfully",
      ...result,
    });
  }
);

export const updateReportsSettingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req?.user?._id;
    const body = updateReportSettingSchema.parse(req.body);

    await updateReportsSettingService(userId, body);

    return res.status(HttpStatusCode.Ok).json({
      message: "Reports setting updated successfully",
    });
  }
);

export const generateReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req?.user?._id;
    const { from, to } = req.query;
    console.log(from, to);
    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const result = await generateReportService(userId, fromDate, toDate);

    return res.status(HttpStatusCode.Ok).json({
      message: "Reports generated successfully",
      ...result,
    });
  }
);
