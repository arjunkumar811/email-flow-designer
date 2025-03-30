import dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT || 5000;
export const mongoURI = process.env.MONGO_URI;
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpiration = "1d";
export const emailHost = process.env.EMAIL_HOST;
export const emailPort = Number(process.env.EMAIL_PORT);
export const emailSecure = process.env.EMAIL_SECURE === "true";
export const emailUser = process.env.EMAIL_USER;
export const emailPassword = process.env.EMAIL_PASSWORD;
