"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedIssue = exports.ManagedIssueId = exports.ManagedIssueState = exports.ContributorVisibility = void 0;
const error_1 = require("./error");
const index_1 = require("./index");
var ContributorVisibility;
(function (ContributorVisibility) {
    ContributorVisibility["PUBLIC"] = "public";
    ContributorVisibility["PRIVATE"] = "private";
})(ContributorVisibility || (exports.ContributorVisibility = ContributorVisibility = {}));
var ManagedIssueState;
(function (ManagedIssueState) {
    ManagedIssueState["OPEN"] = "open";
    ManagedIssueState["REJECTED"] = "rejected";
    ManagedIssueState["SOLVED"] = "solved";
})(ManagedIssueState || (exports.ManagedIssueState = ManagedIssueState = {}));
class ManagedIssueId {
    constructor(uuid) {
        this.uuid = uuid;
    }
}
exports.ManagedIssueId = ManagedIssueId;
class ManagedIssue {
    constructor(id, githubIssueId, requestedDowAmount, managerId, // TODO: need to change to User
    contributorVisibility, state) {
        this.id = id;
        this.githubIssueId = githubIssueId;
        this.requestedDowAmount = requestedDowAmount;
        this.managerId = managerId;
        this.contributorVisibility = contributorVisibility;
        this.state = state;
    }
    static fromBackend(row) {
        const githubIssueId = index_1.IssueId.fromBackendForeignKey(row);
        if (githubIssueId instanceof error_1.ValidationError) {
            return githubIssueId;
        }
        const validator = new error_1.Validator(row);
        const id = validator.requiredString("id");
        const requestedDowAmount = validator.requiredDecimal("requested_dow_amount");
        const managerId = validator.requiredString("manager_id");
        const contributorVisibility = validator.requiredEnum("contributor_visibility", Object.values(ContributorVisibility));
        const state = validator.requiredEnum("state", Object.values(ManagedIssueState));
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new ManagedIssue(new ManagedIssueId(id), githubIssueId, requestedDowAmount, new index_1.UserId(managerId), contributorVisibility, state);
    }
}
exports.ManagedIssue = ManagedIssue;
