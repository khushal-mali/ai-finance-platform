import { Router } from "express";
import {
  generateReportController,
  getAllReportsController,
  updateReportsSettingController,
} from "../controllers/report.controller.js";

const reportRoutes = Router();

reportRoutes.get("/all", getAllReportsController);
reportRoutes.get("/generate", generateReportController);
reportRoutes.put("/update-setting", updateReportsSettingController);

export default reportRoutes;
 
