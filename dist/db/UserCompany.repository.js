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
exports.getUserCompanyRepository = getUserCompanyRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
const config_1 = require("../config");
function getUserCompanyRepository() {
    return new UserCompanyRepositoryImpl((0, dbPool_1.getPool)());
}
class UserCompanyRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    insert(userId, companyId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            config_1.logger.debug(`Inserting user ${userId} to company ${companyId} with role ${role}...`);
            try {
                const result = yield client.query(`
                INSERT INTO user_company (user_id, company_id, role)
                VALUES ($1, $2, $3)
                RETURNING *
                `, [userId.toString(), companyId.toString(), role.toString()]);
                return [
                    new model_1.UserId(result.rows[0].user_id),
                    new model_1.CompanyId(result.rows[0].company_id),
                    role,
                ];
            }
            catch (error) {
                throw error; // You might want to handle specific errors here
            }
            finally {
                client.release();
            }
        });
    }
    delete(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                yield client.query(`
                DELETE FROM user_company
                WHERE user_id = $1 AND company_id = $2
                `, [userId.toString(), companyId.toString()]);
            }
            catch (error) {
                throw error; // Handle errors as needed
            }
            finally {
                client.release();
            }
        });
    }
    getByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
                SELECT *
                FROM user_company
                WHERE user_id = $1
                `, [userId.toString()]);
                return result.rows.map((row) => [
                    new model_1.CompanyId(row.company_id),
                    row.role,
                ]);
            }
            catch (error) {
                throw error; // Handle errors as needed
            }
            finally {
                client.release();
            }
        });
    }
    getByCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
                SELECT *
                FROM user_company
                WHERE company_id = $1
                `, [companyId.toString()]);
                return result.rows.map((row) => [
                    new model_1.UserId(row.user_id),
                    row.role,
                ]);
            }
            catch (error) {
                throw error; // Handle errors as needed
            }
            finally {
                client.release();
            }
        });
    }
}
