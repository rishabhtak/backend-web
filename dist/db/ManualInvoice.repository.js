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
exports.getManualInvoiceRepository = getManualInvoiceRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
const config_1 = require("../config");
function getManualInvoiceRepository() {
    return new ManualInvoiceRepositoryImpl((0, dbPool_1.getPool)());
}
class ManualInvoiceRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneManualInvoice(rows) {
        const manualInvoice = this.getOptionalManualInvoice(rows);
        if (manualInvoice === null) {
            throw new Error("ManualInvoice not found");
        }
        else {
            return manualInvoice;
        }
    }
    getOptionalManualInvoice(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple manual invoices found");
        }
        else {
            const manualInvoice = model_1.ManualInvoice.fromBackend(rows[0]);
            if (manualInvoice instanceof Error) {
                throw manualInvoice;
            }
            return manualInvoice;
        }
    }
    getManualInvoiceList(rows) {
        return rows.map((r) => {
            const manualInvoice = model_1.ManualInvoice.fromBackend(r);
            if (manualInvoice instanceof Error) {
                throw manualInvoice;
            }
            return manualInvoice;
        });
    }
    create(manualInvoice) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const client = yield this.pool.connect();
            config_1.logger.debug(`Creating manual invoice: ${JSON.stringify(manualInvoice)}`);
            try {
                const result = yield client.query(`
                    INSERT INTO manual_invoice (number, company_id, user_id, paid, dow_amount)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                `, [
                    manualInvoice.number,
                    (_a = manualInvoice.companyId) === null || _a === void 0 ? void 0 : _a.uuid.toString(),
                    (_b = manualInvoice.userId) === null || _b === void 0 ? void 0 : _b.uuid.toString(),
                    manualInvoice.paid,
                    manualInvoice.dowAmount.toString(),
                ]);
                return this.getOneManualInvoice(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
    update(manualInvoice) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
                    UPDATE manual_invoice
                    SET number = $1,
                        company_id = $2,
                        user_id = $3,
                        paid = $4,
                        dow_amount = $5
                    WHERE id = $6
                    RETURNING id, number, company_id, user_id, paid, dow_amount
                `, [
                    manualInvoice.number,
                    (_a = manualInvoice.companyId) === null || _a === void 0 ? void 0 : _a.toString(),
                    (_b = manualInvoice.userId) === null || _b === void 0 ? void 0 : _b.toString(),
                    manualInvoice.paid,
                    manualInvoice.dowAmount.toString(),
                    (_c = manualInvoice.id) === null || _c === void 0 ? void 0 : _c.toString(),
                ]);
                return this.getOneManualInvoice(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT *
                FROM manual_invoice
                WHERE id = $1
            `, [id.uuid]);
            return this.getOptionalManualInvoice(result.rows);
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT *
                FROM manual_invoice
            `);
            return this.getManualInvoiceList(result.rows);
        });
    }
    getAllInvoicePaidBy(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (id instanceof model_1.CompanyId) {
                config_1.logger.debug(`Getting all manual invoices paid by company: ${id.toString()}`);
                result = yield this.pool.query(`
                        SELECT *
                        FROM manual_invoice
                        WHERE company_id = $1 AND paid = TRUE
                    `, [id.toString()]);
            }
            else {
                result = yield this.pool.query(`
                        SELECT *
                        FROM manual_invoice
                        WHERE user_id = $1 AND paid = TRUE
                    `, [id.toString()]);
            }
            return this.getManualInvoiceList(result.rows);
        });
    }
}
