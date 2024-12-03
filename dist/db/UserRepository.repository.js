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
exports.getUserRepositoryRepository = getUserRepositoryRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
function getUserRepositoryRepository() {
    return new UserRepositoryRepositoryImpl((0, dbPool_1.getPool)());
}
class UserRepositoryRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOne(rows) {
        const issueFunding = this.getOptional(rows);
        if (issueFunding === null) {
            throw new Error("UserRepository not found");
        }
        else {
            return issueFunding;
        }
    }
    getOptional(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple issue fundings found");
        }
        else {
            const issueFunding = model_1.UserRepository.fromBackend(rows[0]);
            if (issueFunding instanceof Error) {
                throw issueFunding;
            }
            return issueFunding;
        }
    }
    getList(rows) {
        return rows.map((r) => {
            const issueFunding = model_1.UserRepository.fromBackend(r);
            if (issueFunding instanceof Error) {
                throw issueFunding;
            }
            return issueFunding;
        });
    }
    create(userRepository) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
          INSERT INTO user_repository (
            user_id, github_owner_id, github_owner_login, github_repository_id, github_repository_name,
            repository_user_role, dow_rate, dow_currency
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
                    userRepository.userId.toString(),
                    userRepository.repositoryId.ownerId.githubId,
                    userRepository.repositoryId.ownerId.login,
                    userRepository.repositoryId.githubId,
                    userRepository.repositoryId.name,
                    userRepository.repositoryUserRole,
                    userRepository.dowRate.toNumber(),
                    userRepository.dowCurrency,
                ]);
                return this.getOne(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
    getById(userId, repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
        SELECT * FROM user_repository WHERE user_id = $1 AND github_owner_login = $2 AND github_repository_name = $3
      `, [userId.toString(), repositoryId.ownerId.login, repositoryId.name]);
            return this.getOptional(result.rows);
        });
    }
    getAll(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
            SELECT * FROM user_repository WHERE user_id = $1
        `, [userId.toString()]);
            return this.getList(result.rows);
        });
    }
    update(userRepository) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
          UPDATE user_repository
          SET repository_user_role = $1, dow_rate = $2, dow_currency = $3, updated_at = now()
          WHERE user_id = $4 AND github_owner_login = $5 AND github_repository_name = $6
          RETURNING *
        `, [
                    userRepository.repositoryUserRole,
                    userRepository.dowRate.toNumber(),
                    userRepository.dowCurrency,
                    userRepository.userId.toString(),
                    userRepository.repositoryId.ownerId.login,
                    userRepository.repositoryId.name,
                ]);
                return this.getOne(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
    delete(userId, repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(`
        DELETE FROM user_repository WHERE user_id = $1 AND github_owner_login = $2 AND github_repository_name = $3
      `, [userId.toString(), repositoryId.ownerId.login, repositoryId.name]);
        });
    }
}
