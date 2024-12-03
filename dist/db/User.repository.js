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
exports.getUserRepository = getUserRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
const utils_1 = require("../utils");
function getUserRepository() {
    return new UserRepositoryImpl((0, dbPool_1.getPool)());
}
class UserRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneUser(rows, owner = null) {
        const user = this.getOptionalUser(rows, owner);
        if (user === null) {
            throw new Error("User not found");
        }
        else {
            return user;
        }
    }
    getOptionalUser(rows, owner = null) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple users found");
        }
        else {
            const user = model_1.User.fromRaw(rows[0], owner);
            if (user instanceof Error) {
                throw user;
            }
            return user;
        }
    }
    getUserList(rows) {
        return rows.map((r) => {
            const user = model_1.User.fromRaw(r);
            if (user instanceof Error) {
                throw user;
            }
            return user;
        });
    }
    validateEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                UPDATE app_user
                SET is_email_verified = TRUE
                WHERE email = $1
                RETURNING *
            `, [email]);
            return this.getOptionalUser(result.rows);
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT au.*,
                       go.github_id,
                       go.github_type,
                       go.github_login,
                       go.github_html_url,
                       go.github_avatar_url
                FROM app_user au
                         LEFT JOIN github_owner go ON au.github_owner_id = go.github_id
            `, []);
            return this.getUserList(result.rows);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT au.*,
                       go.github_id,
                       go.github_type,
                       go.github_login,
                       go.github_html_url,
                       go.github_avatar_url
                FROM app_user au
                         LEFT JOIN github_owner go ON au.github_owner_id = go.github_id
                WHERE au.id = $1
            `, [id.uuid]);
            return this.getOptionalUser(result.rows);
        });
    }
    insert(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            if (user.data instanceof model_1.LocalUser) {
                const hashedPassword = yield utils_1.encrypt.hashPassword(user.data.password);
                try {
                    const result = yield client.query(`
                INSERT INTO app_user (name, email, is_email_verified, hashed_password, role)
                VALUES ($1, $2, $3, $4, $5) RETURNING *
            `, [user.name, user.data.email, false, hashedPassword, user.role]);
                    return this.getOneUser(result.rows);
                }
                finally {
                    client.release();
                }
            }
            else if (user.data.provider === model_1.Provider.Github) {
                const client = yield this.pool.connect();
                try {
                    yield client.query("BEGIN"); // Start a transaction
                    const owner = user.data.providerData.owner;
                    // Insert or update the Github owner
                    const ownerResult = yield client.query(`
                    INSERT INTO github_owner (github_id, github_type, github_login, github_html_url, github_avatar_url)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (github_id) DO UPDATE
                        SET github_type       = EXCLUDED.github_type,
                            github_login      = EXCLUDED.github_login,
                            github_html_url   = EXCLUDED.github_html_url,
                            github_avatar_url = EXCLUDED.github_avatar_url
                    RETURNING *
                `, [
                        owner.id.githubId,
                        owner.type,
                        owner.id.login,
                        owner.htmlUrl,
                        owner.avatarUrl,
                    ]);
                    // TODO: refactor
                    const githubOwner = model_1.Owner.fromBackend(ownerResult.rows[0]);
                    if (githubOwner instanceof Error) {
                        throw githubOwner;
                    }
                    // Insert or update the ThirdPartyUser
                    const userResult = yield client.query(`
                    INSERT INTO app_user (provider, 
                                          third_party_id, 
                                          name, 
                                          email, 
                                          is_email_verified, 
                                          role,
                                          github_owner_id, 
                                          github_owner_login
                )
                    VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7)
                    ON CONFLICT (third_party_id) DO UPDATE
                        SET provider           = EXCLUDED.provider,
                            name               = EXCLUDED.name,
                            email              = EXCLUDED.email,
                            role               = EXCLUDED.role,
                            github_owner_id    = EXCLUDED.github_owner_id,
                            github_owner_login = EXCLUDED.github_owner_login
                    RETURNING *
                `, [
                        user.data.provider,
                        user.data.id.id,
                        user.name,
                        user.data.email,
                        model_1.UserRole.USER,
                        githubOwner.id.githubId,
                        githubOwner.id.login,
                    ]);
                    const insertedUser = this.getOneUser(userResult.rows, githubOwner);
                    yield client.query("COMMIT"); // Commit the transaction if everything is successful
                    return insertedUser;
                }
                catch (error) {
                    yield client.query("ROLLBACK"); // Rollback the transaction if there's an error
                    throw error;
                }
                finally {
                    client.release(); // Release the client back to the pool
                }
            }
            else {
                throw new Error("Invalid provider, was expecting Github");
            }
        });
    }
    findOne(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT au.id,
                       au.name,
                       au.email,
                       au.is_email_verified,
                       au.hashed_password,
                       au.role,
                       au.provider,
                       au.third_party_id,
                       go.github_id,
                       go.github_type,
                       go.github_login,
                       go.github_html_url,
                       go.github_avatar_url
                FROM app_user au
                         LEFT JOIN github_owner go ON au.github_owner_id = go.github_id
                WHERE au.email = $1
            `, [email]);
            return this.getOptionalUser(result.rows);
        });
    }
    findByThirdPartyId(id, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
                SELECT au.id,
                       au.name,
                       au.email,
                       au.is_email_verified,
                       au.hashed_password,
                       au.role,
                       au.provider,
                       au.third_party_id,
                       go.github_id,
                       go.github_type,
                       go.github_login,
                       go.github_html_url,
                       go.github_avatar_url
                FROM app_user au
                         LEFT JOIN github_owner go ON au.github_owner_id = go.github_id
                WHERE au.third_party_id = $1
                  AND au.provider = $2
            `, [id.id, provider]);
            return this.getOptionalUser(result.rows);
        });
    }
}
