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
exports.getIssueRepository = getIssueRepository;
const model_1 = require("../../model");
const dbPool_1 = require("../../dbPool");
const error_1 = require("../../model/error");
function getIssueRepository() {
    return new IssueRepositoryImpl((0, dbPool_1.getPool)());
}
class IssueRepositoryImpl {
    constructor(pool) {
        this.pool = pool;
    }
    getOneIssue(rows) {
        const issue = this.getOptionalIssue(rows);
        if (issue === null) {
            throw new Error("Issue not found");
        }
        else {
            return issue;
        }
    }
    getOptionalIssue(rows) {
        if (rows.length === 0) {
            return null;
        }
        else if (rows.length > 1) {
            throw new Error("Multiple issues found");
        }
        else {
            const issue = model_1.Issue.fromBackend(rows[0]);
            if (issue instanceof error_1.ValidationError) {
                throw issue;
            }
            return issue;
        }
    }
    getIssueList(rows) {
        return rows.map((r) => {
            const issue = model_1.Issue.fromBackend(r);
            if (issue instanceof error_1.ValidationError) {
                throw issue;
            }
            return issue;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM github_issue;`;
            const result = yield this.pool.query(query);
            return this.getIssueList(result.rows);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT *
                       FROM github_issue
                       WHERE github_owner_login = $1 AND github_repository_name = $2 AND github_number = $3;`;
            const result = yield this.pool.query(query, [
                id.repositoryId.ownerId.login,
                id.repositoryId.name,
                id.number,
            ]);
            return this.getOptionalIssue(result.rows);
        });
    }
    createOrUpdate(issue) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const client = yield this.pool.connect();
            try {
                const query = `
        INSERT INTO github_issue (
          github_id,
          github_owner_id,
          github_owner_login,
          github_repository_id,
          github_repository_name,
          github_number,
          github_title,
          github_html_url,
          github_created_at,
          github_closed_at,
          github_open_by_owner_id,
          github_open_by_owner_login,
          github_body
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (github_owner_login, github_repository_name, github_number) DO UPDATE
          SET
            github_id = EXCLUDED.github_id,
            github_owner_id = EXCLUDED.github_owner_id,
            github_owner_login = EXCLUDED.github_owner_login,
            github_repository_name = EXCLUDED.github_repository_name,
            github_title = EXCLUDED.github_title,
            github_html_url = EXCLUDED.github_html_url,
            github_created_at = EXCLUDED.github_created_at,
            github_closed_at = EXCLUDED.github_closed_at,
            github_open_by_owner_id = EXCLUDED.github_open_by_owner_id,
            github_open_by_owner_login = EXCLUDED.github_open_by_owner_login,
            github_body = EXCLUDED.github_body,
            updated_at = NOW()
        RETURNING *;
      `;
                const values = [
                    (_a = issue.id.githubId) === null || _a === void 0 ? void 0 : _a.toString(),
                    issue.id.repositoryId.ownerId.githubId,
                    issue.id.repositoryId.ownerId.login,
                    (_b = issue.id.repositoryId.githubId) === null || _b === void 0 ? void 0 : _b.toString(),
                    issue.id.repositoryId.name,
                    issue.id.number,
                    issue.title,
                    issue.htmlUrl,
                    issue.createdAt.toISOString(),
                    issue.closedAt ? issue.closedAt.toISOString() : null,
                    (_d = (_c = issue.openBy) === null || _c === void 0 ? void 0 : _c.githubId) === null || _d === void 0 ? void 0 : _d.toString(),
                    issue.openBy.login,
                    issue.body,
                ];
                const result = yield client.query(query, values);
                return this.getOneIssue(result.rows);
            }
            finally {
                client.release();
            }
        });
    }
}
