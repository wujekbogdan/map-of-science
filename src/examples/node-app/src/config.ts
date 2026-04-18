import "dotenv/config";

export const config = {
  port: process.env.PORT,
  host: process.env.HOST,
} as const;
