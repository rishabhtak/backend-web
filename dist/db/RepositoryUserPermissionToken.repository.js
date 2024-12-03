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
exports.getRepositoryUserPermissionTokenRepository = getRepositoryUserPermissionTokenRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
const config_1 = require("../config");
function getRepositoryUserPermissionTokenRepository() {
    return new RepositoryUserPermissionTokenRepositoryImpl((0, dbPool_1.getPool)());
}
class RepositoryUserPermissionTokenRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneToken(rows) {
        const token = this.getOptionalToken(rows);
        if (token === null) {
            config_1.logger.error("RepositoryUserPermissionToken not found");
            throw new Error("RepositoryUserPermissionToken not found");
        }
        else {
            config_1.logger.debug("RepositoryUserPermissionToken retrieved successfully");
            return token;
        }
    }
    getOptionalToken(rows) {
        if (rows.length === 0) {
            config_1.logger.debug("No RepositoryUserPermissionToken found");
            return null;
        }
        else if (rows.length > 1) {
            config_1.logger.error("Multiple tokens found");
            throw new Error("Multiple tokens found");
        }
        else {
            const token = model_1.RepositoryUserPermissionToken.fromBackend(rows[0]);
            if (token instanceof Error) {
                config_1.logger.error("Error creating RepositoryUserPermissionToken from backend data", token);
                throw token;
            }
            config_1.logger.debug("RepositoryUserPermissionToken created successfully from backend data");
            return token;
        }
    }
    getTokenList(rows) {
        return rows.map((r) => {
            const token = model_1.RepositoryUserPermissionToken.fromBackend(r);
            if (token instanceof Error) {
                config_1.logger.error("Error creating RepositoryUserPermissionToken from backend data", token);
                throw token;
            }
            config_1.logger.debug("RepositoryUserPermissionToken created successfully from backend data");
            return token;
        });
    }
    create(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                config_1.logger.debug("Creating RepositoryUserPermissionToken with data: ", token);
                const result = yield client.query(`
                    INSERT INTO repository_user_permission_token (
                                                                  user_name,
                                                                  user_email,
                                                                  user_github_owner_login, 
                                                                  token,
                                                                  github_owner_id,
                                                                  github_owner_login,
                                                                  github_repository_id,
                                                                  github_repository_name,
                                                                  repository_user_role, 
                                                                  dow_rate, 
                                                                  dow_currency, 
                                                                  expires_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING *
                `, [
                    token.userName,
                    token.userEmail,
                    token.userGithubOwnerLogin,
                    token.token,
                    token.repositoryId.ownerId.githubId,
                    token.repositoryId.ownerId.login,
                    token.repositoryId.githubId,
                    token.repositoryId.name,
                    token.repositoryUserRole,
                    token.dowRate.toString(),
                    token.dowCurrency.toString(),
                    token.expiresAt,
                ]);
                config_1.logger.debug("RepositoryUserPermissionToken created successfully");
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
                config_1.logger.debug("Updating RepositoryUserPermissionToken with ID: {}", token.id);
                const result = yield client.query(`
                    UPDATE repository_user_permission_token
                    SET user_name = $1,
                        user_github_owner_login = $2,
                        token = $3,
                        github_owner_id = $4,
                        github_owner_login = $5,
                        github_repository_id = $6,
                        github_repository_name = $7,
                        repository_user_role = $8,
                        dow_rate = $9,
                        dow_currency = $10,
                        expires_at = $11,
                        updated_at = now()
                    WHERE id = $12
                    RETURNING *
                `, [
                    token.userName,
                    token.userGithubOwnerLogin,
                    token.token,
                    token.repositoryId.ownerId.githubId,
                    token.repositoryId.ownerId.login,
                    token.repositoryId.githubId,
                    token.repositoryId.name,
                    token.repositoryUserRole,
                    token.dowRate.toString(),
                    token.dowCurrency.toString(),
                    token.expiresAt,
                    token.id.toString(),
                ]);
                config_1.logger.debug("RepositoryUserPermissionToken updated successfully");
                return this.getOneToken(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.logger.debug("Retrieving RepositoryUserPermissionToken by ID: ", id);
            const result = yield this.pool.query(`
                SELECT *
                FROM repository_user_permission_token
                WHERE id = $1
            `, [id.toString()]);
            return this.getOptionalToken(result.rows);
        });
    }
    getByRepositoryId(repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.logger.debug("Retrieving RepositoryUserPermissionTokens by repository ID: ", repositoryId);
            const result = yield this.pool.query(`
                SELECT *
                FROM repository_user_permission_token
                WHERE github_owner_login = $1
                  AND github_repository_name = $2
            `, [repositoryId.ownerLogin(), repositoryId.name]);
            return this.getTokenList(result.rows);
        });
    }
    getByUserGithubOwnerLogin(userGithubOwnerLogin) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.logger.debug("Retrieving RepositoryUserPermissionToken by userGithubOwnerLogin: {}", userGithubOwnerLogin);
            const result = yield this.pool.query(`
                SELECT *
                FROM repository_user_permission_token
                WHERE user_github_owner_login = $1
            `, [userGithubOwnerLogin]);
            return this.getOptionalToken(result.rows);
        });
    }
    getByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.logger.debug("Retrieving RepositoryUserPermissionToken by token: {}", token);
            const result = yield this.pool.query(`
                SELECT *
                FROM repository_user_permission_token
                WHERE token = $1
            `, [token]);
            return this.getOptionalToken(result.rows);
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.logger.debug("Retrieving all RepositoryUserPermissionTokens");
            const result = yield this.pool.query(`
                SELECT *
                FROM repository_user_permission_token
            `);
            return this.getTokenList(result.rows);
        });
    }
    delete(token) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.logger.debug("Deleting permission token: {}", token);
            yield this.pool.query(`
                DELETE FROM repository_user_permission_token
                WHERE token = $1
            `, [token]);
        });
    }
}
