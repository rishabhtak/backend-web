"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = isAuth;
const http_status_codes_1 = require("http-status-codes");
function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.sendStatus(http_status_codes_1.StatusCodes.UNAUTHORIZED);
}
