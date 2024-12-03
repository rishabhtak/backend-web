"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDowNumberRepository = getDowNumberRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
const ManualInvoice_repository_1 = require("./ManualInvoice.repository");
const config_1 = require("../config");
const decimal_js_1 = __importDefault(require("decimal.js"));
function getDowNumberRepository() {
    return new DowNumberRepositoryImpl((0, dbPool_1.getPool)());
}
class DowNumberRepositoryImpl {
    constructor(pool) {
        this.manualInvoiceRepo = (0, ManualInvoice_repository_1.getManualInvoiceRepository)();
        this.pool = pool;
    }
    getAvailableDoWs(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.logger.debug(`Getting available DoW for user ${userId} and company ${companyId}...`);
            let totalDoWsPaid = new decimal_js_1.default(0);
            // Calculate total DoW from manual invoices
            const manualInvoices = yield this.manualInvoiceRepo.getAllInvoicePaidBy(companyId !== null && companyId !== void 0 ? companyId : userId);
            totalDoWsPaid = totalDoWsPaid.plus(manualInvoices.reduce((acc, invoice) => acc.plus(invoice.dowAmount), new decimal_js_1.default(0)));
            config_1.logger.debug(`Total DoW from manual invoices: ${totalDoWsPaid}`);
            // Calculate total DoW from Stripe invoices
            const amountPaidWithStripe = yield this.getAllStripeInvoicePaidBy(companyId !== null && companyId !== void 0 ? companyId : userId);
            config_1.logger.debug(`Total DoW from Stripe invoices: ${amountPaidWithStripe}`);
            totalDoWsPaid = totalDoWsPaid.plus(amountPaidWithStripe);
            const totalFunding = yield this.getIssueFundingFrom(companyId !== null && companyId !== void 0 ? companyId : userId);
            config_1.logger.debug(`Total issue funding: ${totalFunding}`);
            if (totalFunding.isNeg()) {
                config_1.logger.error(`The amount dow amount (${totalFunding}) is negative for userId ${userId.toString()}, companyId ${companyId ? companyId.toString() : ""}`);
            }
            else if (totalDoWsPaid.minus(totalFunding).isNeg()) {
                config_1.logger.debug(`The total DoW paid (${totalDoWsPaid}) is less than the total funding (${totalFunding}) for userId ${userId.toString()}, companyId ${companyId ? companyId.toString() : ""}`);
            }
            return totalDoWsPaid.minus(totalFunding);
        });
    }
    getAllStripeInvoicePaidBy(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let result;
            // TODO: potential lost of precision with the numbers
            if (id instanceof model_1.CompanyId) {
                const query = `
          SELECT SUM(sl.quantity * sp.unit_amount) AS total_dow_paid
          FROM stripe_invoice_line sl
                   JOIN stripe_product sp ON sl.product_id = sp.stripe_id
                   JOIN stripe_invoice si ON sl.invoice_id = si.stripe_id
          WHERE sl.customer_id IN
                (SELECT sc.stripe_id
                 FROM user_company uc
                          JOIN stripe_customer sc ON uc.company_id = $1 AND uc.user_id = sc.user_id)
            AND sp.unit = 'DoW'
            AND si.paid = TRUE
      `;
                result = yield this.pool.query(query, [id.toString()]);
            }
            else {
                const query = `
        SELECT SUM(sl.quantity * sp.unit_amount) AS total_dow_paid
        FROM stripe_invoice_line sl
               JOIN stripe_product sp ON sl.product_id = sp.stripe_id
               JOIN stripe_invoice si ON sl.invoice_id = si.stripe_id
               JOIN stripe_customer sc ON sl.customer_id = sc.stripe_id
        WHERE sc.user_id = $1
          AND sp.unit = 'DoW'
          AND si.paid = true
            `;
                result = yield this.pool.query(query, [id.toString()]);
            }
            try {
                return new decimal_js_1.default((_b = (_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.total_dow_paid) !== null && _b !== void 0 ? _b : 0);
            }
            catch (error) {
                config_1.logger.error("Error executing query", error);
                throw new Error("Failed to retrieve paid invoice total");
            }
        });
    }
    getIssueFundingFrom(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let result;
            // TODO: potential lost of precision with the numbers
            if (id instanceof model_1.CompanyId) {
                const query = `
                SELECT SUM(if.dow_amount) AS total_funding
                FROM issue_funding if
                         JOIN user_company uc ON if.user_id = uc.user_id
                         LEFT JOIN managed_issue mi ON if.github_issue_id = mi.github_issue_id
                WHERE uc.company_id = $1
                  AND (mi.state != 'rejected' OR mi.state is NULL)
            `;
                result = yield this.pool.query(query, [id.toString()]);
            }
            else {
                const query = `
                SELECT SUM(if.dow_amount) AS total_funding
                FROM issue_funding if
                         LEFT JOIN managed_issue mi ON if.github_issue_id = mi.github_issue_id
                WHERE if.user_id = $1
                  AND (mi.state != 'rejected' OR mi.state is NULL)
            `;
                result = yield this.pool.query(query, [id.toString()]);
            }
            try {
                return new decimal_js_1.default((_b = (_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.total_funding) !== null && _b !== void 0 ? _b : 0);
            }
            catch (error) {
                config_1.logger.error("Error executing query", error);
                throw new Error("Failed to retrieve total funding amount");
            }
        });
    }
}
