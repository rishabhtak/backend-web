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
exports.getStripeProductRepository = getStripeProductRepository;
const dbPool_1 = require("../../dbPool");
const model_1 = require("../../model");
function getStripeProductRepository() {
    return new StripeProductRepositoryImpl((0, dbPool_1.getPool)());
}
class StripeProductRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneProduct(rows) {
        const product = this.getOptionalProduct(rows);
        if (product === null) {
            throw new Error("Product not found");
        }
        else {
            return product;
        }
    }
    getOptionalProduct(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple products found");
        }
        else {
            const product = model_1.StripeProduct.fromBackend(rows[0]);
            if (product instanceof Error) {
                throw product;
            }
            return product;
        }
    }
    getProductList(rows) {
        return rows.map((r) => {
            const product = model_1.StripeProduct.fromBackend(r);
            if (product instanceof Error) {
                throw product;
            }
            return product;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
        SELECT *
        FROM stripe_product
    `);
            return this.getProductList(result.rows);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
        SELECT *
        FROM stripe_product
        WHERE stripe_id = $1
      `, [id.toString()]);
            return this.getOptionalProduct(result.rows);
        });
    }
    insert(product) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
          INSERT INTO stripe_product (
              stripe_id, unit, unit_amount, recurring
          ) VALUES ($1, $2, $3, $4)
          RETURNING stripe_id, unit, unit_amount, recurring
        `, [
                    product.stripeId.toString(),
                    product.unit,
                    product.unitAmount,
                    product.recurring,
                ]);
                return this.getOneProduct(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
}
