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
exports.getOwnerRepository = getOwnerRepository;
const model_1 = require("../../model");
const dbPool_1 = require("../../dbPool");
function getOwnerRepository() {
    return new OwnerRepositoryImpl((0, dbPool_1.getPool)());
}
class OwnerRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneOwner(rows) {
        const owner = this.getOptionalOwner(rows);
        if (owner === null) {
            throw new Error("Owner not found");
        }
        else {
            return owner;
        }
    }
    getOptionalOwner(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple owners found");
        }
        else {
            const owner = model_1.Owner.fromBackend(rows[0]);
            if (owner instanceof Error) {
                throw owner;
            }
            return owner;
        }
    }
    getOwnerList(rows) {
        return rows.map((r) => {
            const owner = model_1.Owner.fromBackend(r);
            if (owner instanceof Error) {
                throw owner;
            }
            return owner;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
            SELECT github_id, github_type, github_login, github_html_url, github_avatar_url 
            FROM github_owner
        `);
            return this.getOwnerList(result.rows);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM github_owner WHERE github_login = $1`;
            const result = yield this.pool.query(query, [id.login]);
            return this.getOptionalOwner(result.rows);
        });
    }
    insertOrUpdate(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
            INSERT INTO github_owner (github_id, github_login, github_type, github_html_url, github_avatar_url)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (github_login) DO UPDATE
                SET github_id         = EXCLUDED.github_id,
                    github_type       = EXCLUDED.github_type,
                    github_html_url   = EXCLUDED.github_html_url,
                    github_avatar_url = EXCLUDED.github_avatar_url,
                    updated_at        = NOW()
            RETURNING github_id, github_login, github_type, github_html_url, github_avatar_url
        `, [
                    owner.id.githubId,
                    owner.id.login,
                    owner.type,
                    owner.htmlUrl,
                    owner.avatarUrl,
                ]);
                return this.getOneOwner(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
}
