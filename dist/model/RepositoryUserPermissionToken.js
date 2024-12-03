"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryUserPermissionToken = exports.RepositoryUserPermissionTokenId = exports.DowCurrency = exports.RepositoryUserRole = void 0;
const error_1 = require("./error");
const index_1 = require("./index");
const decimal_js_1 = __importDefault(require("decimal.js"));
var RepositoryUserRole;
(function (RepositoryUserRole) {
    RepositoryUserRole["ADMIN"] = "admin";
    RepositoryUserRole["READ"] = "read";
})(RepositoryUserRole || (exports.RepositoryUserRole = RepositoryUserRole = {}));
var DowCurrency;
(function (DowCurrency) {
    DowCurrency["USD"] = "USD";
    DowCurrency["EUR"] = "EUR";
    DowCurrency["GBP"] = "GBP";
})(DowCurrency || (exports.DowCurrency = DowCurrency = {}));
class RepositoryUserPermissionTokenId {
    constructor(uuid) {
        this.uuid = uuid;
    }
    toString() {
        return this.uuid;
    }
}
exports.RepositoryUserPermissionTokenId = RepositoryUserPermissionTokenId;
class RepositoryUserPermissionToken {
    constructor(id, userName, userEmail, userGithubOwnerLogin, token, repositoryId, repositoryUserRole, dowRate, dowCurrency, expiresAt) {
        this.id = id;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userGithubOwnerLogin = userGithubOwnerLogin;
        this.token = token;
        this.repositoryId = repositoryId;
        this.repositoryUserRole = repositoryUserRole;
        this.dowRate = new decimal_js_1.default(dowRate);
        this.dowCurrency = dowCurrency;
        this.expiresAt = expiresAt;
    }
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        const id = validator.requiredString("id");
        const userName = validator.optionalString("user_name");
        const userEmail = validator.requiredString("user_email");
        const userGithubOwnerLogin = validator.requiredString("user_github_owner_login");
        const token = validator.requiredString("token");
        const repositoryId = index_1.RepositoryId.fromBackendForeignKey(row);
        if (repositoryId instanceof error_1.ValidationError) {
            return repositoryId;
        }
        const repositoryUserRole = validator.requiredEnum("repository_user_role", Object.values(RepositoryUserRole));
        const dowRate = validator.requiredDecimal("dow_rate");
        const dowCurrency = validator.requiredEnum("dow_currency", Object.values(DowCurrency));
        const expiresAt = validator.requiredDate("expires_at");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new RepositoryUserPermissionToken(new RepositoryUserPermissionTokenId(id), userName !== null && userName !== void 0 ? userName : null, userEmail, userGithubOwnerLogin, token, repositoryId, repositoryUserRole, dowRate, dowCurrency, expiresAt);
    }
}
exports.RepositoryUserPermissionToken = RepositoryUserPermissionToken;
