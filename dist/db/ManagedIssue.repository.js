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
exports.getManagedIssueRepository = getManagedIssueRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
function getManagedIssueRepository() {
    return new ManagedIssueRepositoryImpl((0, dbPool_1.getPool)());
}
class ManagedIssueRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneManagedIssue(rows) {
        const managedIssue = this.getOptionalManagedIssue(rows);
        if (managedIssue === null) {
            throw new Error("ManagedIssue not found");
        }
        else {
            return managedIssue;
        }
    }
    getOptionalManagedIssue(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple managed issues found");
        }
        else {
            const managedIssue = model_1.ManagedIssue.fromBackend(rows[0]);
            if (managedIssue instanceof Error) {
                throw managedIssue;
            }
            return managedIssue;
        }
    }
    getManagedIssueList(rows) {
        return rows.map((r) => {
            const managedIssue = model_1.ManagedIssue.fromBackend(r);
            if (managedIssue instanceof Error) {
                throw managedIssue;
            }
            return managedIssue;
        });
    }
    create(managedIssue) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
            INSERT INTO managed_issue (github_owner_id,
                                       github_owner_login,
                                       github_repository_id,
                                       github_repository_name,
                                       github_issue_id,
                                       github_issue_number,
                                       requested_dow_amount,
                                       manager_id,
                                       contributor_visibility,
                                       state)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id,
              github_owner_id,
              github_owner_login,
              github_repository_id,
              github_repository_name,
              github_issue_id,
              github_issue_number,
                requested_dow_amount, 
                manager_id, 
                contributor_visibility, 
                state
        `, [
                    managedIssue.githubIssueId.repositoryId.ownerId.githubId,
                    managedIssue.githubIssueId.repositoryId.ownerId.login,
                    managedIssue.githubIssueId.repositoryId.githubId,
                    managedIssue.githubIssueId.repositoryId.name,
                    managedIssue.githubIssueId.githubId,
                    managedIssue.githubIssueId.number,
                    managedIssue.requestedDowAmount.toString(),
                    managedIssue.managerId.toString(),
                    managedIssue.contributorVisibility,
                    managedIssue.state,
                ]);
                return this.getOneManagedIssue(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
    update(managedIssue) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                const result = yield client.query(`
        UPDATE managed_issue
        SET
            github_owner_id = $1,
            github_owner_login = $2,
            github_repository_id = $3,
            github_repository_name = $4,
            github_issue_id = $5,
            github_issue_number = $6,
                requested_dow_amount = $7, 
                manager_id = $8, 
                contributor_visibility = $9, 
                state = $10
        WHERE id = $11
        RETURNING id,
          github_owner_id,
          github_owner_login,
          github_repository_id,
          github_repository_name,
          github_issue_id,
          github_issue_number,
            requested_dow_amount, 
            manager_id, 
            contributor_visibility, 
            state
        `, [
                    managedIssue.githubIssueId.repositoryId.ownerId.githubId,
                    managedIssue.githubIssueId.repositoryId.ownerId.login,
                    managedIssue.githubIssueId.repositoryId.githubId,
                    managedIssue.githubIssueId.repositoryId.name,
                    managedIssue.githubIssueId.githubId,
                    managedIssue.githubIssueId.number,
                    managedIssue.requestedDowAmount.toString(),
                    managedIssue.managerId.toString(),
                    managedIssue.contributorVisibility,
                    managedIssue.state,
                    managedIssue.id.uuid,
                ]);
                return this.getOneManagedIssue(result.rows);
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
      FROM managed_issue
      WHERE id = $1
      `, [id.uuid]);
            return this.getOptionalManagedIssue(result.rows);
        });
    }
    getByIssueId(issueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
        SELECT *
        FROM managed_issue
        WHERE github_owner_login = $1 AND github_repository_name = $2 AND github_issue_number = $3
        `, [
                issueId.repositoryId.ownerId.login,
                issueId.repositoryId.name,
                issueId.number,
            ]);
            return this.getOptionalManagedIssue(result.rows);
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.pool.query(`
      SELECT *
      FROM managed_issue
    `);
            return this.getManagedIssueList(result.rows);
        });
    }
}
