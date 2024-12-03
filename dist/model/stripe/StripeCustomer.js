"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeCustomer = exports.StripeCustomerId = void 0;
const error_1 = require("../error");
const user_1 = require("../user");
class StripeCustomerId {
    constructor(id) {
        this.id = id;
    }
    static fromJson(json) {
        const validator = new error_1.Validator(json);
        validator.requiredString("id");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripeCustomerId(json.id);
    }
    toString() {
        return this.id;
    }
}
exports.StripeCustomerId = StripeCustomerId;
class StripeCustomer {
    constructor(stripeId, userId) {
        this.stripeId = stripeId;
        this.userId = userId;
    }
    static fromStripeApi(json) {
        const validator = new error_1.Validator(json);
        const id = validator.requiredString("id");
        const userId = validator.requiredString("user_id");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripeCustomer(new StripeCustomerId(id), new user_1.UserId(userId));
    }
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        const id = validator.requiredString("stripe_id");
        const userId = validator.requiredString("user_id");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripeCustomer(new StripeCustomerId(id), new user_1.UserId(userId));
    }
}
exports.StripeCustomer = StripeCustomer;
