"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWebsiteAdmin = isWebsiteAdmin;
const model_1 = require("../model");
const http_status_codes_1 = require("http-status-codes");
function isWebsiteAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === model_1.UserRole.SUPER_ADMIN) {
        return next();
    }
    res.sendStatus(http_status_codes_1.StatusCodes.FORBIDDEN);
}
