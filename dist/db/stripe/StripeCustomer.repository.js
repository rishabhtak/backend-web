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
exports.getStripeCustomerRepository = getStripeCustomerRepository;
const model_1 = require("../../model");
const dbPool_1 = require("../../dbPool");
function getStripeCustomerRepository() {
    return new StripeCustomerRepositoryImpl((0, dbPool_1.getPool)());
}
class StripeCustomerRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneCustomer(rows) {
        const customer = this.getOptionalCustomer(rows);
        if (customer === null) {
            throw new Error("Customer not found");
        }
        else {
            return customer;
        }
    }
    getOptionalCustomer(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple customers found");
        }
        else {
            const customer = model_1.StripeCustomer.fromBackend(rows[0]);
            if (customer instanceof Error) {
                throw customer;
            }
            return customer;
        }
    }
    getCustomerList(rows) {
        return rows.map((r) => {
            const customer = model_1.StripeCustomer.fromBackend(r);
            if (customer instanceof Error) {
                throw customer;
            }
            return customer;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
            SELECT *
            FROM stripe_customer
        `);
            return this.getCustomerList(result.rows);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT *
                FROM stripe_customer
                WHERE stripe_id = $1
            `, [id.toString()]);
            return this.getOptionalCustomer(result.rows);
        });
    }
    insert(customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                yield client.query("BEGIN");
                const result = yield client.query(`
                    INSERT INTO stripe_customer (stripe_id, user_id)
                    VALUES ($1, $2)
                    RETURNING stripe_id, user_id
                `, [customer.stripeId.toString(), customer.userId.toString()]);
                yield client.query("COMMIT");
                return this.getOneCustomer(result.rows);
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
}
