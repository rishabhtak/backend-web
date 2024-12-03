"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyUserPermissionToken = exports.CompanyUserPermissionTokenId = exports.CompanyUserRole = void 0;
const error_1 = require("./error");
const index_1 = require("./index");
var CompanyUserRole;
(function (CompanyUserRole) {
    CompanyUserRole["ADMIN"] = "admin";
    CompanyUserRole["SUGGEST"] = "suggest";
    CompanyUserRole["READ"] = "read";
})(CompanyUserRole || (exports.CompanyUserRole = CompanyUserRole = {}));
class CompanyUserPermissionTokenId {
    constructor(uuid) {
        this.uuid = uuid;
    }
    toString() {
        return this.uuid;
    }
}
exports.CompanyUserPermissionTokenId = CompanyUserPermissionTokenId;
class CompanyUserPermissionToken {
    constructor(id, userName, userEmail, token, companyId, companyUserRole, expiresAt) {
        this.id = id;
        this.userName = userName;
        this.userEmail = userEmail;
        this.token = token;
        this.companyId = companyId;
        this.companyUserRole = companyUserRole;
        this.expiresAt = expiresAt;
    }
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        const id = validator.requiredString("id");
        const userName = validator.optionalString("user_name");
        const userEmail = validator.requiredString("user_email");
        const token = validator.requiredString("token");
        const companyId = validator.requiredString("company_id");
        const companyUserRole = validator.requiredEnum("company_user_role", Object.values(CompanyUserRole));
        const expiresAt = validator.requiredDate("expires_at");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new CompanyUserPermissionToken(new CompanyUserPermissionTokenId(id), userName !== null && userName !== void 0 ? userName : null, userEmail, token, new index_1.CompanyId(companyId), companyUserRole, expiresAt);
    }
}
exports.CompanyUserPermissionToken = CompanyUserPermissionToken;
