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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripeInvoiceLineRepository = getStripeInvoiceLineRepository;
const model_1 = require("../../model");
const dbPool_1 = require("../../dbPool");
function getStripeInvoiceLineRepository() {
    return new StripeInvoiceLineRepositoryImpl((0, dbPool_1.getPool)());
}
class StripeInvoiceLineRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneInvoiceLine(rows) {
        const invoiceLine = this.getOptionalInvoiceLine(rows);
        if (invoiceLine === null) {
            throw new Error("Invoice line not found");
        }
        else {
            return invoiceLine;
        }
    }
    getOptionalInvoiceLine(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple invoice lines found");
        }
        else {
            const invoiceLine = model_1.StripeInvoiceLine.fromBackend(rows[0]);
            if (invoiceLine instanceof Error) {
                throw invoiceLine;
            }
            return invoiceLine;
        }
    }
    getInvoiceLineList(rows) {
        return rows.map((r) => {
            const invoiceLine = model_1.StripeInvoiceLine.fromBackend(r);
            if (invoiceLine instanceof Error) {
                throw invoiceLine;
            }
            return invoiceLine;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
            SELECT stripe_id, invoice_id, customer_id, product_id, price_id, quantity
            FROM stripe_invoice_line
        `);
            return this.getInvoiceLineList(result.rows);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
            SELECT stripe_id, invoice_id, customer_id, product_id, price_id, quantity
            FROM stripe_invoice_line
            WHERE stripe_id = $1
        `, [id.toString()]);
            return this.getOptionalInvoiceLine(result.rows);
        });
    }
    getByInvoiceId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
            SELECT stripe_id, invoice_id, customer_id, product_id, price_id, quantity
            FROM stripe_invoice_line
            WHERE invoice_id = $1
        `, [id.toString()]);
            return this.getInvoiceLineList(result.rows);
        });
    }
    insert(invoiceLine) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
                INSERT INTO stripe_invoice_line (
                    stripe_id, invoice_id, customer_id, product_id, price_id, quantity
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING stripe_id, invoice_id, customer_id, product_id, price_id, quantity
            `, [
                    invoiceLine.stripeId.toString(),
                    invoiceLine.invoiceId.toString(),
                    invoiceLine.customerId.toString(),
                    invoiceLine.productId.toString(),
                    invoiceLine.priceId.toString(),
                    invoiceLine.quantity,
                ]);
                return this.getOneInvoiceLine(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
}
