import { Router } from "express";
import { upload } from "../config/cloudinary.config.js";
import {
  getCurrentUserController,
  updateUserController,
} from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.get("/current-user", getCurrentUserController);
userRoutes.put("/update", upload.single("profilePicture"), updateUserController);

export default userRoutes;
