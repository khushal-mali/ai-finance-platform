import "dotenv/config";
import "./config/passport.config.js";
import cors from "cors";
import express from "express";
import connectDatabase from "./config/database.config.js";
import { Env } from "./config/env.config.js";
import { HTTPSTATUS } from "./config/http.config.js";
import { asyncHandler } from "./middlewares/asyncHandler.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import authRoutes from "./routes/auth.route.js";
import passport from "passport";
import { passportAuthenticateJwt } from "./config/passport.config.js";
import userRoutes from "./routes/user.route.js";
import transactionRoutes from "./routes/transaction.route.js";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req, res, next) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "Hello! I am server.",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectDatabase();

  console.log(`server running on port --${Env.PORT} on ${Env.NODE_ENV} mode`);
});
