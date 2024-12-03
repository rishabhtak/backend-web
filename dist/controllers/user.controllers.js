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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const db_1 = require("../db/");
const http_status_codes_1 = require("http-status-codes");
const model_1 = require("../model");
const ApiError_1 = require("../model/error/ApiError");
const dowNumberRepository = (0, db_1.getDowNumberRepository)();
class UserController {
    static getAvailableDow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Unauthorized");
            }
            const userId = req.user.id;
            const companyId = req.query.companyId
                ? new model_1.CompanyId(req.query.companyId)
                : undefined;
            const dowAmount = yield dowNumberRepository.getAvailableDoWs(userId, companyId);
            const response = {
                dowAmount: dowAmount.toString(),
            };
            return res.status(http_status_codes_1.StatusCodes.OK).send({ success: response });
        });
    }
}
exports.UserController = UserController;
