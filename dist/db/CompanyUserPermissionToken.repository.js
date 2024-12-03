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
exports.getCompanyUserPermissionTokenRepository = getCompanyUserPermissionTokenRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
const config_1 = require("../config");
function getCompanyUserPermissionTokenRepository() {
    return new CompanyUserPermissionTokenRepositoryImpl((0, dbPool_1.getPool)());
}
class CompanyUserPermissionTokenRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneToken(rows) {
        const token = this.getOptionalToken(rows);
        if (token === null) {
            throw new Error("CompanyUserPermissionToken not found");
        }
        else {
            return token;
        }
    }
    getOptionalToken(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple tokens found");
        }
        else {
            const token = model_1.CompanyUserPermissionToken.fromBackend(rows[0]);
            if (token instanceof Error) {
                throw token;
            }
            return token;
        }
    }
    getTokenList(rows) {
        return rows.map((r) => {
            const token = model_1.CompanyUserPermissionToken.fromBackend(r);
            if (token instanceof Error) {
                throw token;
            }
            return token;
        });
    }
    create(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
                    INSERT INTO company_user_permission_token (user_name, user_email, token, company_id, company_user_role, expires_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `, [
                    token.userName,
                    token.userEmail,
                    token.token,
                    token.companyId.uuid.toString(),
                    token.companyUserRole,
                    token.expiresAt,
                ]);
                return this.getOneToken(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
    update(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
                    UPDATE company_user_permission_token
                    SET user_name        = $1,
                        user_email        = $2,
                        token             = $3,
                        company_id        = $4,
                        company_user_role = $5,
                        expires_at        = $6
                    WHERE id = $7
                    RETURNING *
                `, [
                    token.userName,
                    token.userEmail,
                    token.token,
                    token.companyId.toString(),
                    token.companyUserRole,
                    token.expiresAt,
                    token.id.toString(),
                ]);
                return this.getOneToken(result.rows);
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
                FROM company_user_permission_token
                WHERE id = $1
            `, [id.toString()]);
            return this.getOptionalToken(result.rows);
        });
    }
    getByUserEmail(userEmail, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT *
                FROM company_user_permission_token
                WHERE user_email = $1
                  AND company_id = $2
            `, [userEmail, companyId.uuid.toString()]);
            return this.getTokenList(result.rows);
        });
    }
    getByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT *
                FROM company_user_permission_token
                WHERE token = $1
            `, [token]);
            return this.getOptionalToken(result.rows);
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
            SELECT *
            FROM company_user_permission_token
        `);
            return this.getTokenList(result.rows);
        });
    }
    delete(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(`
                    DELETE
                    FROM company_user_permission_token
                    WHERE token = $1
            `, [token]);
            config_1.logger.debug("Deleting permission token: ", token);
        });
    }
}
