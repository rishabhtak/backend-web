"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalUser = void 0;
const error_1 = require("../error");
class LocalUser {
    constructor(email, isEmailVerified, passport) {
        this.email = email;
        this.isEmailVerified = isEmailVerified;
        this.password = passport;
    }
    static fromRaw(row) {
        const validator = new error_1.Validator(row);
        validator.requiredString("email");
        validator.requiredBoolean("is_email_verified");
        validator.requiredString("hashed_password");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new LocalUser(row.email, row.is_email_verified, row.hashed_password);
    }
}
exports.LocalUser = LocalUser;
