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
exports.getIssueFundingRepository = getIssueFundingRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
const config_1 = require("../config");
function getIssueFundingRepository() {
    return new IssueFundingRepositoryImpl((0, dbPool_1.getPool)());
}
class IssueFundingRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneIssueFunding(rows) {
        const issueFunding = this.getOptionalIssueFunding(rows);
        if (issueFunding === null) {
            throw new Error("IssueFunding not found");
        }
        else {
            return issueFunding;
        }
    }
    getOptionalIssueFunding(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple issue fundings found");
        }
        else {
            const issueFunding = model_1.IssueFunding.fromBackend(rows[0]);
            if (issueFunding instanceof Error) {
                throw issueFunding;
            }
            return issueFunding;
        }
    }
    getIssueFundingList(rows) {
        return rows.map((r) => {
            const issueFunding = model_1.IssueFunding.fromBackend(r);
            if (issueFunding instanceof Error) {
                throw issueFunding;
            }
            return issueFunding;
        });
    }
    create(issueFunding) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            config_1.logger.debug("Creating issue funding", JSON.stringify(issueFunding));
            try {
                const result = yield client.query(`
                    INSERT INTO issue_funding (github_owner_id,
                                               github_owner_login,
                                               github_repository_id,
                                               github_repository_name,
                                               github_issue_id,
                                               github_issue_number,
                                               user_id,
                                               dow_amount)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id,
                        github_owner_id,
                        github_owner_login,
                        github_repository_id,
                        github_repository_name,
                        github_issue_id,
                        github_issue_number,
                        user_id,
                        dow_amount
                `, [
                    issueFunding.githubIssueId.repositoryId.ownerId.githubId,
                    issueFunding.githubIssueId.repositoryId.ownerId.login,
                    issueFunding.githubIssueId.repositoryId.githubId,
                    issueFunding.githubIssueId.repositoryId.name,
                    issueFunding.githubIssueId.githubId,
                    issueFunding.githubIssueId.number,
                    issueFunding.userId.toString(),
                    issueFunding.downAmount.toString(),
                ]);
                return this.getOneIssueFunding(result.rows);
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
                FROM issue_funding
                WHERE id = $1
            `, [id.toString()]);
            return this.getOptionalIssueFunding(result.rows);
        });
    }
    getAll(issueId) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (issueId) {
                result = yield this.pool.query(`
                SELECT *
                FROM issue_funding
                WHERE github_owner_login = $1 AND github_repository_name = $2 AND github_issue_number = $3
            `, [
                    issueId.repositoryId.ownerId.login,
                    issueId.repositoryId.name,
                    issueId.number,
                ]);
            }
            else {
                result = yield this.pool.query(`
            SELECT *
            FROM issue_funding
        `);
            }
            return this.getIssueFundingList(result.rows);
        });
    }
}
