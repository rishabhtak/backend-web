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
exports.getStripeInvoiceRepository = getStripeInvoiceRepository;
const model_1 = require("../../model");
const dbPool_1 = require("../../dbPool");
const StripeInvoiceLine_repository_1 = require("./StripeInvoiceLine.repository");
function getStripeInvoiceRepository() {
    return new StripeInvoiceRepositoryImpl((0, dbPool_1.getPool)());
}
class StripeInvoiceRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
        this.stripeInvoiceLineRepository = (0, StripeInvoiceLine_repository_1.getStripeInvoiceLineRepository)();
    }
    getOneInvoice(rows, lines) {
        const invoice = this.getOptionalInvoice(rows, lines);
        if (invoice === null) {
            throw new Error("Invoice not found");
        }
        else {
            return invoice;
        }
    }
    getOptionalInvoice(rows, lines) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple invoices found");
        }
        else {
            const invoice = model_1.StripeInvoice.fromBackend(rows[0], lines);
            if (invoice instanceof Error) {
                throw invoice;
            }
            return invoice;
        }
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT stripe_id,
                       customer_id,
                       paid,
                       account_country,
                       currency,
                       total,
                       total_excl_tax,
                       subtotal,
                       subtotal_excl_tax,
                       hosted_invoice_url,
                       invoice_pdf
                FROM stripe_invoice
                WHERE stripe_id = $1
            `, [id.toString()]);
            const lines = yield this.stripeInvoiceLineRepository.getByInvoiceId(id);
            const invoice = this.getOptionalInvoice(result.rows, lines);
            if (!invoice) {
                return null;
            }
            return invoice;
        });
    }
    insert(invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                yield client.query("BEGIN");
                const result = yield client.query(`
                    INSERT INTO stripe_invoice (stripe_id, customer_id, paid, account_country, currency, total,
                                                total_excl_tax, subtotal, subtotal_excl_tax, hosted_invoice_url,
                                                invoice_pdf)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING stripe_id, customer_id, paid, account_country, currency, total, total_excl_tax, subtotal, subtotal_excl_tax, hosted_invoice_url, invoice_pdf
                `, [
                    invoice.id.toString(),
                    invoice.customerId.toString(),
                    invoice.paid,
                    invoice.accountCountry,
                    invoice.currency,
                    invoice.total,
                    invoice.totalExclTax,
                    invoice.subtotal,
                    invoice.subtotalExclTax,
                    invoice.hostedInvoiceUrl,
                    invoice.invoicePdf,
                ]);
                // Insert associated invoice lines
                for (const line of invoice.lines) {
                    yield client.query(`
                        INSERT INTO stripe_invoice_line (stripe_id, invoice_id, customer_id, product_id, price_id,
                                                         quantity)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `, [
                        line.stripeId.toString(),
                        line.invoiceId.toString(),
                        line.customerId.toString(),
                        line.productId.toString(),
                        line.priceId.toString(),
                        line.quantity,
                    ]);
                }
                yield client.query("COMMIT");
                return invoice; // TODO: Return the invoice created
            }
            catch (error) {
                yield client.query("ROLLBACK");
                throw error;
            }
            finally {
                client.release();
            }
        });
    }
    getAllInvoicePaidBy(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (id instanceof model_1.CompanyId) {
                result = yield this.pool.query(`
                SELECT *
                FROM stripe_invoice
                WHERE customer_id IN (
                    SELECT stripe_id FROM stripe_customer WHERE user_id IN (
                        SELECT user_id FROM user_company WHERE company_id = $1
                    )
                ) AND paid = TRUE
                `, [id.toString()]);
            }
            else {
                result = yield this.pool.query(`
                SELECT *
                FROM stripe_invoice
                WHERE customer_id IN (
                    SELECT stripe_id FROM stripe_customer WHERE user_id = $1
                ) AND paid = TRUE
                `, [id.toString()]);
            }
            return result.rows;
        });
    }
}
