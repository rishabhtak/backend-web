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
exports.Migration = void 0;
const fs_1 = __importDefault(require("fs"));
class Migration {
    constructor(pool) {
        this.pool = pool;
    }
    migrate() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = fs_1.default.readFileSync("src/db/migration.sql").toString();
            const stripe = fs_1.default.readFileSync("src/db/stripe.sql").toString();
            yield this.pool.query(sql);
            yield this.pool.query(stripe);
            yield this.pool.query(`SET timezone = 'UTC';`);
        });
    }
    drop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(`
        DROP TABLE IF EXISTS user_session CASCADE;
        DROP TABLE IF EXISTS company CASCADE;
        DROP TABLE IF EXISTS address CASCADE;
        DROP TABLE IF EXISTS github_issue CASCADE;
        DROP TABLE IF EXISTS github_repository CASCADE;
        DROP TABLE IF EXISTS github_owner CASCADE;
        DROP TABLE IF EXISTS user_company CASCADE;
        DROP TABLE IF EXISTS third_party_user_company CASCADE;
        DROP TABLE IF EXISTS app_user CASCADE;
        DROP TABLE IF EXISTS stripe_invoice_line CASCADE;
        DROP TABLE IF EXISTS stripe_invoice CASCADE;
        DROP TABLE IF EXISTS stripe_customer CASCADE;
        DROP TABLE IF EXISTS stripe_product CASCADE;
        DROP TABLE IF EXISTS issue_funding CASCADE;
        DROP TABLE IF EXISTS managed_issue CASCADE;
        DROP TABLE IF EXISTS repository_user_permission_token CASCADE;
        DROP TABLE IF EXISTS company_user_permission_token CASCADE;
        DROP TABLE IF EXISTS repository_user_permission_token CASCADE;
        DROP TABLE IF EXISTS manual_invoice CASCADE;
        DROP TABLE IF EXISTS user_repository CASCADE;
    `);
        });
    }
}
exports.Migration = Migration;
