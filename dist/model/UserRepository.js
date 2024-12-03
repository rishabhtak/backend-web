"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const error_1 = require("./error");
const index_1 = require("./index");
const decimal_js_1 = __importDefault(require("decimal.js"));
class UserRepository {
    constructor(userId, repositoryId, repositoryUserRole, dowRate, dowCurrency) {
        this.userId = userId;
        this.repositoryId = repositoryId;
        this.repositoryUserRole = repositoryUserRole;
        this.dowRate = dowRate;
        this.dowCurrency = dowCurrency;
    }
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        const userId = validator.requiredString("user_id");
        const repositoryId = index_1.RepositoryId.fromBackendForeignKey(row);
        if (repositoryId instanceof error_1.ValidationError) {
            return repositoryId;
        }
        const repositoryUserRole = validator.requiredEnum("repository_user_role", Object.values(index_1.RepositoryUserRole));
        const dowRate = validator.requiredNumber("dow_rate");
        const dowCurrency = validator.requiredString("dow_currency");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new UserRepository(new index_1.UserId(userId), repositoryId, repositoryUserRole, new decimal_js_1.default(dowRate), // TODO: improve
        dowCurrency);
    }
}
exports.UserRepository = UserRepository;
