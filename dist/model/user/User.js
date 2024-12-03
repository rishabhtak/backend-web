"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = exports.UserId = void 0;
const LocalUser_1 = require("./LocalUser");
const ThirdPartyUser_1 = require("./ThirdPartyUser");
const error_1 = require("../error");
class UserId {
    constructor(uuid) {
        this.uuid = uuid;
    }
    toString() {
        return this.uuid;
    }
}
exports.UserId = UserId;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
class User {
    constructor(id, name, data, role) {
        this.id = id;
        this.name = name;
        this.data = data;
        this.role = role;
    }
    email() {
        if (this.data instanceof LocalUser_1.LocalUser) {
            return this.data.email;
        }
        else {
            return this.data.email;
        }
    }
    githubData() {
        if (this.data instanceof ThirdPartyUser_1.ThirdPartyUser) {
            return this.data.providerData;
        }
        else {
            return null;
        }
    }
    static fromRaw(row, owner = null) {
        const validator = new error_1.Validator(row);
        const id = validator.requiredString("id");
        const name = validator.optionalString("name");
        const role = validator.requiredEnum("role", Object.values(UserRole));
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        let user;
        if (row.hashed_password) {
            user = LocalUser_1.LocalUser.fromRaw(row);
        }
        else if (row.provider) {
            user = ThirdPartyUser_1.ThirdPartyUser.fromRaw(row, owner);
        }
        else {
            return new error_1.ValidationError("Unable to determine user type", row);
        }
        if (user instanceof error_1.ValidationError) {
            return user;
        }
        const enumError = validator.getFirstError();
        if (enumError) {
            return enumError;
        }
        return new User(new UserId(id), name !== null && name !== void 0 ? name : null, user, role);
    }
}
exports.User = User;
