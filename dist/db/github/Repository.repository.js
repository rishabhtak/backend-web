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
exports.getRepositoryRepository = getRepositoryRepository;
const model_1 = require("../../model");
const dbPool_1 = require("../../dbPool");
const error_1 = require("../../model/error");
function getRepositoryRepository() {
    return new RepositoryRepositoryImpl((0, dbPool_1.getPool)());
}
class RepositoryRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneRepository(rows) {
        const repository = this.getOptionalRepository(rows);
        if (repository === null) {
            throw new Error("Repository not found");
        }
        else {
            return repository;
        }
    }
    getOptionalRepository(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple repositories found");
        }
        else {
            const repository = model_1.Repository.fromBackend(rows[0]);
            if (repository instanceof error_1.ValidationError) {
                throw repository;
            }
            return repository;
        }
    }
    getRepositoryList(rows) {
        return rows.map((r) => {
            const repository = model_1.Repository.fromBackend(r);
            if (repository instanceof error_1.ValidationError) {
                throw repository;
            }
            return repository;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM github_repository`;
            const result = yield this.pool.query(query);
            return this.getRepositoryList(result.rows);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM github_repository WHERE github_owner_login = $1 AND github_name = $2;`;
            const result = yield this.pool.query(query, [id.ownerId.login, id.name]);
            return this.getOptionalRepository(result.rows);
        });
    }
    insertOrUpdate(repository) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
            INSERT INTO github_repository (github_id, github_owner_id, github_owner_login, github_name, github_html_url, github_description)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (github_id) DO UPDATE
              SET github_owner_id = EXCLUDED.github_owner_id,
                  github_owner_login = EXCLUDED.github_owner_login,
                  github_name = EXCLUDED.github_name,
                  github_html_url = EXCLUDED.github_html_url,
                  github_description = EXCLUDED.github_description,
                  updated_at = NOW()
            RETURNING github_id, github_owner_id, github_owner_login, github_name, github_html_url, github_description
          `, [
                    repository.id.githubId,
                    repository.id.ownerId.githubId,
                    repository.id.ownerId.login,
                    repository.id.name,
                    repository.htmlUrl,
                    repository.description,
                ]);
                return this.getOneRepository(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
}
