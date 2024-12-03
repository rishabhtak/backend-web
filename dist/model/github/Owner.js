"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOwner = exports.Owner = exports.OwnerType = exports.OwnerId = void 0;
const error_1 = require("../error");
class OwnerId {
    constructor(login, id) {
        this.login = login;
        this.githubId = id;
    }
    static fromGithubApi(json) {
        return OwnerId.fromAny(json, "login", "id");
    }
    static fromBackendPrimaryKey(row) {
        return OwnerId.fromAny(row, "github_login", "github_id");
    }
    static fromBackendForeignKey(row) {
        return OwnerId.fromAny(row, "github_owner_login", "github_owner_id");
    }
    static fromAny(data, loginKey, idKey) {
        let json;
        if (typeof data === "object") {
            json = data;
        }
        else if (typeof data === "string") {
            json = JSON.parse(data);
        }
        const validator = new error_1.Validator(json);
        const login = validator.requiredString(loginKey);
        const id = validator.requiredNumber(idKey);
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new OwnerId(login, id);
    }
}
exports.OwnerId = OwnerId;
var OwnerType;
(function (OwnerType) {
    OwnerType["User"] = "User";
    OwnerType["Organization"] = "Organization";
})(OwnerType || (exports.OwnerType = OwnerType = {}));
class Owner {
    constructor(id, type, htmlUrl, avatarUrl) {
        this.id = id;
        this.type = type;
        this.htmlUrl = htmlUrl;
        this.avatarUrl = avatarUrl;
    }
    // For Organization
    // Github API: https://docs.github.com/en/rest/orgs/orgs?apiVersion=2022-11-28#get-an-organization
    // Example: https://api.github.com/orgs/open-source-economy
    //
    // For User
    // Github API: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user
    // Example: https://api.github.com/users/laurianemollier
    static fromGithubApi(data) {
        let json;
        if (typeof data === "object") {
            json = data;
        }
        else if (typeof data === "string") {
            json = JSON.parse(data);
        }
        const validator = new error_1.Validator(json);
        const htmlUrl = validator.requiredString("html_url");
        const avatarUrl = validator.optionalString("avatar_url");
        const type = validator.requiredEnum("type", Object.values(OwnerType));
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        const ownerId = OwnerId.fromGithubApi(json);
        if (ownerId instanceof error_1.ValidationError) {
            return ownerId;
        }
        return new Owner(ownerId, type, htmlUrl, avatarUrl);
    }
    static fromBackend(json) {
        const validator = new error_1.Validator(json);
        // @ts-ignore
        const type = validator.requiredEnum("github_type", Object.values(OwnerType));
        const htmlUrl = validator.requiredString("github_html_url");
        const avatarUrl = validator.requiredString("github_avatar_url");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        const ownerId = OwnerId.fromBackendPrimaryKey(json);
        if (ownerId instanceof error_1.ValidationError) {
            return ownerId;
        }
        return new Owner(ownerId, type, htmlUrl, avatarUrl);
    }
}
exports.Owner = Owner;
class UserOwner extends Owner {
    static fromGithubApi(json) {
        const owner = Owner.fromGithubApi(json);
        if (owner instanceof error_1.ValidationError) {
            return owner;
        }
        if (owner.type !== OwnerType.User) {
            return new error_1.ValidationError("Invalid JSON: owner is not a user", json);
        }
        return owner;
    }
}
exports.UserOwner = UserOwner;
