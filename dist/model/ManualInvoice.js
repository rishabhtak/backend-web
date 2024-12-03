"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualInvoice = exports.ManualInvoiceId = void 0;
const error_1 = require("./error");
const index_1 = require("./index");
class ManualInvoiceId {
    constructor(uuid) {
        this.uuid = uuid;
    }
    toString() {
        return this.uuid;
    }
}
exports.ManualInvoiceId = ManualInvoiceId;
class ManualInvoice {
    constructor(id, number, companyId, userId, paid, dowAmount) {
        this.id = id;
        this.number = number;
        this.companyId = companyId;
        this.userId = userId;
        this.paid = paid;
        this.dowAmount = dowAmount;
    }
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        const id = validator.requiredString("id");
        const number = validator.requiredNumber("number");
        const companyId = validator.optionalString("company_id");
        const userId = validator.optionalString("user_id");
        const paid = validator.requiredBoolean("paid");
        const dowAmount = validator.requiredDecimal("dow_amount");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new ManualInvoice(new ManualInvoiceId(id), number, companyId ? new index_1.CompanyId(companyId) : undefined, userId ? new index_1.UserId(userId) : undefined, paid, dowAmount);
    }
}
exports.ManualInvoice = ManualInvoice;
