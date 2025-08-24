import "dotenv/config";
import express from "express";
import { Env } from "./config/env.config.js";
import cors from "cors";
import { HTTPSTATUS } from "./config/http.config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { BadRequestException } from "./utils/app-error.js";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get("/", (req, res, next) => {
  throw new BadRequestException("This is a bad request");
  return res.status(HTTPSTATUS.OK).json({
    message: "Hello! I am server.",
  });
});

app.use(errorHandler);

app.listen(Env.PORT, () => {
  console.log(`server running on port --${Env.PORT} on ${Env.NODE_ENV} mode`);
});
