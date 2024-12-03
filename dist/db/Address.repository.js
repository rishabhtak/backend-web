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
exports.getAddressRepository = getAddressRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
function getAddressRepository() {
    return new AddressRepositoryImpl((0, dbPool_1.getPool)());
}
class AddressRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneAddress(rows) {
        const address = this.getOptionalAddress(rows);
        if (address === null) {
            throw new Error("Address not found");
        }
        else {
            return address;
        }
    }
    getOptionalAddress(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple company address found");
        }
        else {
            const address = model_1.Address.fromBackend(rows[0]);
            if (address instanceof Error) {
                throw address;
            }
            return address;
        }
    }
    getAddressList(rows) {
        return rows.map((r) => {
            const address = model_1.Address.fromBackend(r);
            if (address instanceof Error) {
                throw address;
            }
            return address;
        });
    }
    getByCompanyId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
      SELECT a.*
      FROM address a
      JOIN company c ON a.id = c.address_id
      WHERE c.id = $1
      `, [id.toString()]);
            return this.getOptionalAddress(result.rows);
        });
    }
    getCompanyUserAddress(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
      SELECT a.*
      FROM user_company uc
      JOIN company c ON uc.company_id = c.id
      JOIN address a ON c.address_id = a.id
      WHERE uc.user_id = $1
      `, [id.toString()]);
            return this.getOptionalAddress(result.rows);
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
      SELECT *
      FROM address
    `);
            return this.getAddressList(result.rows);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
      SELECT *
      FROM address
      WHERE id = $1
      `, [id.uuid]);
            return this.getOptionalAddress(result.rows);
        });
    }
    create(address) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
                    INSERT INTO address (name, line_1, line_2, city,
                                                        state, postal_code, country)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id, name, line_1, line_2, city, state, postal_code, country
                `, [
                    (_a = address.name) !== null && _a !== void 0 ? _a : null,
                    (_b = address.line1) !== null && _b !== void 0 ? _b : null,
                    (_c = address.line2) !== null && _c !== void 0 ? _c : null,
                    (_d = address.city) !== null && _d !== void 0 ? _d : null,
                    (_e = address.state) !== null && _e !== void 0 ? _e : null,
                    (_f = address.postalCode) !== null && _f !== void 0 ? _f : null,
                    (_g = address.country) !== null && _g !== void 0 ? _g : null,
                ]);
                return this.getOneAddress(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
    update(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
                UPDATE address
                SET
                    name = $1,
                    line_1 = $2,
                    line_2 = $3,
                    city = $4,
                    state = $5,
                    postal_code = $6,
                    country = $7
                WHERE id = $8
                RETURNING id, name, line_1, line_2, city, state, postal_code, country
            `, [
                    address.name,
                    address.line1,
                    address.line2,
                    address.city,
                    address.state,
                    address.postalCode,
                    address.country,
                    address.id.uuid,
                ]);
                return this.getOneAddress(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
}
