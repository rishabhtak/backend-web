import morgan from "morgan";
import { Request, Response } from "express";
import { config } from "./config";
import { NodeEnv } from "./NodeEnv";
import { logger } from "./logger";

// Define a custom token for morgan to extract error message from res.locals
morgan.token(
  "message",
  (req: Request, res: Response) => res.locals.errorMessage || "",
);

// Function to get IP format based on environment
const getIpFormat = () =>
  config.env === NodeEnv.Production ? ":remote-addr - " : "";

// Formats for success and error responses
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

// Morgan middleware instances
export const successHandler = morgan(successResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode >= 400,
  stream: { write: (message: string) => logger.info(message.trim()) },
});

export const errorHandler = morgan(errorResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode < 400,
  stream: { write: (message: string) => logger.error(message.trim()) },
});
