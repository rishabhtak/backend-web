"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdPartyUser = exports.GithubData = exports.Provider = exports.ThirdPartyUserId = void 0;
const Owner_1 = require("../github/Owner");
const error_1 = require("../error");
class ThirdPartyUserId {
    constructor(id) {
        this.id = id;
    }
}
exports.ThirdPartyUserId = ThirdPartyUserId;
var Provider;
(function (Provider) {
    Provider["Github"] = "github";
})(Provider || (exports.Provider = Provider = {}));
class GithubData {
    constructor(owner) {
        this.owner = owner;
    }
}
exports.GithubData = GithubData;
class ThirdPartyUser {
    constructor(provider, id, email, providerData) {
        this.provider = provider;
        this.id = id;
        this.email = email;
        this.providerData = providerData;
    }
    // TODO: check
    static fromJson(json) {
        const validator = new error_1.Validator(json);
        const provider = validator.requiredEnum("provider", Object.values(Provider));
        const id = validator.requiredString("id");
        validator.optionalObject("_json");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        const owner = Owner_1.Owner.fromGithubApi(json._json);
        if (owner instanceof error_1.ValidationError) {
            return owner;
        }
        const providerData = new GithubData(owner);
        return new ThirdPartyUser(provider, new ThirdPartyUserId(json.id), null, providerData);
    }
    static fromRaw(row, owner = null) {
        const validator = new error_1.Validator(row);
        const provider = validator.requiredEnum("provider", Object.values(Provider));
        const thirdPartyId = validator.requiredString("third_party_id");
        const email = validator.optionalString("email");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        if (owner === null) {
            const o = Owner_1.Owner.fromBackend(row);
            if (o instanceof error_1.ValidationError) {
                return o;
            }
            owner = o;
        }
        const providerData = new GithubData(owner); // TODO: refactor
        return new ThirdPartyUser(provider, new ThirdPartyUserId(thirdPartyId), email !== null && email !== void 0 ? email : null, providerData);
    }
}
exports.ThirdPartyUser = ThirdPartyUser;
