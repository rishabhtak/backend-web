"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorConverter = errorConverter;
exports.errorHandler = errorHandler;
const config_1 = require("../config");
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = require("../model/error/ApiError");
function errorConverter(err, req, res, next) {
    let error = err;
    if (!(error instanceof ApiError_1.ApiError)) {
        const statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error.message || "Internal Server Error";
        error = new ApiError_1.ApiError(statusCode, message, false, err.stack);
    }
    next(error);
}
function errorHandler(err, req, res, next) {
    let { statusCode, message } = err;
    if (config_1.config.env === config_1.NodeEnv.Production && !err.isOperational) {
        statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
        message = "Internal Server Error";
    }
    res.locals.errorMessage = err.message;
    const response = Object.assign({ code: statusCode, message }, (config_1.config.env !== config_1.NodeEnv.Production && { stack: err.stack }));
    if (config_1.config.env === config_1.NodeEnv.Local) {
        config_1.logger.error(err);
    }
    res.status(statusCode).send(response);
}
