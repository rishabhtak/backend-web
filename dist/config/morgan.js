"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.successHandler = void 0;
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const NodeEnv_1 = require("./NodeEnv");
const logger_1 = require("./logger");
// Define a custom token for morgan to extract error message from res.locals
morgan_1.default.token("message", (req, res) => res.locals.errorMessage || "");
// Function to get IP format based on environment
const getIpFormat = () => config_1.config.env === NodeEnv_1.NodeEnv.Production ? ":remote-addr - " : "";
// Formats for success and error responses
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;
// Morgan middleware instances
exports.successHandler = (0, morgan_1.default)(successResponseFormat, {
    skip: (req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger_1.logger.info(message.trim()) },
});
exports.errorHandler = (0, morgan_1.default)(errorResponseFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: { write: (message) => logger_1.logger.error(message.trim()) },
});
