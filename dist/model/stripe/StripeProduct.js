"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeProduct = exports.StripeProductId = void 0;
const error_1 = require("../error");
class StripeProductId {
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
        return new StripeProductId(json.id);
    }
    toString() {
        return this.id;
    }
}
exports.StripeProductId = StripeProductId;
class StripeProduct {
    constructor(stripeId, unit, unitAmount, recurring) {
        this.stripeId = stripeId;
        this.unit = unit;
        this.unitAmount = unitAmount;
        this.recurring = recurring;
    }
    // Method to create a StripeProduct from a JSON response from the Stripe API
    static fromStripeApi(json) {
        const validator = new error_1.Validator(json);
        validator.requiredString("id");
        validator.requiredString("unit");
        validator.requiredNumber("unit_amount");
        validator.requiredBoolean("recurring");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripeProduct(new StripeProductId(json.id), json.unit, json.unit_amount, json.recurring);
    }
    // Method to create a StripeProduct from a database row
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        validator.requiredString("stripe_id");
        validator.requiredString("unit");
        validator.requiredNumber("unit_amount");
        validator.requiredBoolean("recurring");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripeProduct(new StripeProductId(row.stripe_id), row.unit, row.unit_amount, row.recurring);
    }
}
exports.StripeProduct = StripeProduct;
