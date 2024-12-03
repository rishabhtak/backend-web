"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeInvoiceLine = exports.StripeInvoiceLineId = void 0;
const error_1 = require("../error");
const StripeInvoice_1 = require("./StripeInvoice");
const StripeCustomer_1 = require("./StripeCustomer");
const StripeProduct_1 = require("./StripeProduct");
const StripePrice_1 = require("./StripePrice");
class StripeInvoiceLineId {
    constructor(id) {
        this.id = id;
    }
    static fromStripeApi(json) {
        const validator = new error_1.Validator(json);
        validator.requiredString("id");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripeInvoiceLineId(json.id);
    }
    toString() {
        return this.id;
    }
}
exports.StripeInvoiceLineId = StripeInvoiceLineId;
class StripeInvoiceLine {
    constructor(stripeId, invoiceId, customerId, productId, priceId, quantity) {
        this.stripeId = stripeId;
        this.invoiceId = invoiceId;
        this.customerId = customerId;
        this.productId = productId;
        this.priceId = priceId;
        this.quantity = quantity;
    }
    static fromStripeApi(customerId, json) {
        const validator = new error_1.Validator(json);
        validator.requiredNumber("id");
        validator.requiredString("invoice");
        validator.requiredObject("price");
        validator.requiredString("price.id");
        validator.requiredObject("price.product");
        validator.requiredNumber("quantity");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripeInvoiceLine(new StripeInvoiceLineId(json.id), new StripeInvoice_1.StripeInvoiceId(json.invoice), customerId, new StripeProduct_1.StripeProductId(json.price.product), new StripePrice_1.StripePriceId(json.price.id), json.quantity);
    }
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        validator.requiredString("stripe_id");
        validator.requiredString("invoice_id");
        validator.requiredString("customer_id");
        validator.requiredString("product_id");
        validator.requiredString("price_id");
        validator.requiredNumber("quantity");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new StripeInvoiceLine(new StripeInvoiceLineId(row.stripe_id), new StripeInvoice_1.StripeInvoiceId(row.invoice_id), new StripeCustomer_1.StripeCustomerId(row.customer_id), new StripeProduct_1.StripeProductId(row.product_id), new StripePrice_1.StripePriceId(row.price_id), row.quantity);
    }
}
exports.StripeInvoiceLine = StripeInvoiceLine;
