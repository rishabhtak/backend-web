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
exports.getCompanyRepository = getCompanyRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
function getCompanyRepository() {
    return new CompanyRepositoryImpl((0, dbPool_1.getPool)());
}
class CompanyRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneCompany(rows) {
        const company = this.getOptionalCompany(rows);
        if (company === null) {
            throw new Error("Company not found");
        }
        else {
            return company;
        }
    }
    getOptionalCompany(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple company found");
        }
        else {
            const company = model_1.Company.fromBackend(rows[0]);
            if (company instanceof Error) {
                throw company;
            }
            return company;
        }
    }
    getCompanyList(rows) {
        return rows.map((r) => {
            const company = model_1.Company.fromBackend(r);
            if (company instanceof Error) {
                throw company;
            }
            return company;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
      SELECT *
      FROM company
    `);
            return this.getCompanyList(result.rows);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
      SELECT *
      FROM company
      WHERE id = $1
      `, [id.toString()]);
            return this.getOptionalCompany(result.rows);
        });
    }
    // TODO: ensure taxId is not "" or variation of empty string
    create(company) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
      INSERT INTO company (tax_id, name, address_id)
      VALUES ($1, $2, $3) 
      RETURNING *
      `, [
                    company.taxId,
                    company.name,
                    (_b = (_a = company.addressId) === null || _a === void 0 ? void 0 : _a.uuid.toString()) !== null && _b !== void 0 ? _b : null,
                ]);
                return this.getOneCompany(result.rows);
            }
            catch (error) {
                throw error;
            }
            finally {
                client.release();
            }
        });
    }
    update(company) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
        UPDATE company
        SET tax_id = $1,
            name = $2,
            address_id = $3
        WHERE id = $4
        RETURNING *
        `, [
                    company.taxId,
                    company.name,
                    (_b = (_a = company.addressId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : null,
                    company.id.toString(),
                ]);
                return this.getOneCompany(result.rows);
            }
            catch (error) {
                throw error;
            }
            finally {
                client.release();
            }
        });
    }
}
