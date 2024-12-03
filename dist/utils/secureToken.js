"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureToken = void 0;
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = require("../model/error/ApiError");
const http_status_codes_1 = require("http-status-codes");
const uuid_1 = require("uuid");
class secureToken {
    /**
     *
     * @param data data email or userId
     *
     * @returns token and the expiration date
     */
    static generate(data) {
        const expiresSecond = config_1.config.jwt.accessExpirationMinutes * 60;
        const expiresAt = new Date(Date.now() + expiresSecond * 1000);
        const token = jsonwebtoken_1.default.sign(Object.assign({ exp: Math.floor(Date.now() / 1000) + expiresSecond, jti: (0, uuid_1.v4)() }, data), config_1.config.jwt.secret);
        return [token, expiresAt];
    }
    static verify(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
            }
            catch (err) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, `Invalid token: ${err}`);
            }
        });
    }
}
exports.secureToken = secureToken;
