"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripePrice = exports.StripePriceId = void 0;
const error_1 = require("../error");
class StripePriceId {
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
        return new StripePriceId(json.id);
    }
    toString() {
        return this.id;
    }
}
exports.StripePriceId = StripePriceId;
class StripePrice {
    constructor(stripeId, currency, unitAmount) {
        this.stripeId = stripeId;
        this.currency = currency;
        this.unitAmount = unitAmount;
    }
    // Method to create a StripePrice from a JSON response from the Stripe API
    static fromStripeApi(json) {
        const validator = new error_1.Validator(json);
        validator.requiredString("id");
        validator.requiredString("currency");
        validator.requiredNumber("unit_amount");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripePrice(new StripePriceId(json.id), json.currency, json.unit_amount);
    }
    // Method to create a StripePrice from a database row
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        validator.requiredString("stripe_id");
        validator.requiredString("currency");
        validator.requiredNumber("unit_amount");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripePrice(new StripePriceId(row.stripe_id), row.currency, row.unit_amount);
    }
}
exports.StripePrice = StripePrice;
