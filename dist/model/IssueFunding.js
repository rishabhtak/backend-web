"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueFunding = exports.IssueFundingId = void 0;
const error_1 = require("./error");
const github_1 = require("./github");
const user_1 = require("./user");
class IssueFundingId {
    constructor(uuid) {
        this.uuid = uuid;
    }
    toString() {
        return this.uuid;
    }
}
exports.IssueFundingId = IssueFundingId;
class IssueFunding {
    constructor(id, githubIssueId, userId, amount) {
        this.id = id;
        this.githubIssueId = githubIssueId;
        this.userId = userId;
        this.dowAmount = amount;
    }
    static fromBackend(row) {
        const githubIssueId = github_1.IssueId.fromBackendForeignKey(row);
        if (githubIssueId instanceof error_1.ValidationError) {
            return githubIssueId;
        }
        const validator = new error_1.Validator(row);
        const id = validator.requiredString("id");
        const userId = validator.requiredString("user_id");
        const amount = validator.requiredDecimal("dow_amount");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new IssueFunding(new IssueFundingId(id), githubIssueId, new user_1.UserId(userId), amount);
    }
}
exports.IssueFunding = IssueFunding;
