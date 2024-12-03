"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const NodeEnv_1 = require("./NodeEnv");
const config_1 = require("./config");
const enumerateErrorFormat = winston_1.default.format((info) => {
    if (info instanceof Error && info.stack) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});
exports.logger = winston_1.default.createLogger({
    level: config_1.config.env === NodeEnv_1.NodeEnv.Production ? "info" : "debug",
    format: winston_1.default.format.combine(enumerateErrorFormat(), config_1.config.env === NodeEnv_1.NodeEnv.Local
        ? winston_1.default.format.colorize()
        : winston_1.default.format.uncolorize(), winston_1.default.format.splat(), winston_1.default.format.printf((info) => `${info.level}: ${info.message}`)),
    transports: [
        new winston_1.default.transports.Console({
            stderrLevels: ["error", "warn", "info", "debug"],
            debugStdout: true,
            forceConsole: true,
        }),
    ],
});
