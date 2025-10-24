import { getEnv } from "../utils/get-env.js";

const envConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),

  PORT: getEnv("PORT", "8000"),
  MONGO_URI: getEnv("MONGO_URI"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),

  JWT_SECRET: getEnv("JWT_SECRET", "jwt_secret_key"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),

  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "jwt_refresh_secret_key"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d") as string,

  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),

  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),

  RESENT_API_KEY: getEnv("RESENT_API_KEY"),
  RESEND_MAILER_SENDER: getEnv("RESEND_MAILER_SENDER"),

  CRON_SECRET: getEnv("CRON_SECRET"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
});

export const Env = envConfig();
