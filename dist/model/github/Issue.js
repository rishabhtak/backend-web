"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Issue = exports.IssueId = void 0;
const Owner_1 = require("./Owner");
const Repository_1 = require("./Repository");
const error_1 = require("../error");
class IssueId {
    constructor(repositoryId, number, githubId) {
        this.repositoryId = repositoryId;
        this.number = number;
        this.githubId = githubId;
    }
    toString() {
        return `${this.repositoryId.ownerLogin()}/${this.repositoryId.name}/${this.number}`;
    }
    ownerLogin() {
        return this.repositoryId.ownerLogin();
    }
    repositoryName() {
        return this.repositoryId.name;
    }
    static fromGithubApi(repositoryId, json) {
        const validator = new error_1.Validator(json);
        const number = validator.requiredNumber("number");
        const id = validator.requiredNumber("id");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new IssueId(repositoryId, number, id);
    }
    static fromBackend(row) {
        return IssueId.fromAny(row, "github_number", "github_id");
    }
    static fromBackendForeignKey(row) {
        return IssueId.fromAny(row, "github_issue_number", "github_issue_id");
    }
    static fromAny(data, numberKey, idKey) {
        let json;
        if (typeof data === "object") {
            json = data;
        }
        else if (typeof data === "string") {
            json = JSON.parse(data);
        }
        const repositoryId = Repository_1.RepositoryId.fromBackendForeignKey(json);
        if (repositoryId instanceof error_1.ValidationError) {
            return repositoryId;
        }
        const validator = new error_1.Validator(json);
        const number = validator.requiredNumber(numberKey);
        const id = validator.requiredNumber(idKey);
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new IssueId(repositoryId, number, id);
    }
}
exports.IssueId = IssueId;
class Issue {
    constructor(id, title, htmlUrl, createdAt, closedAt, openBy, body) {
        this.id = id;
        this.title = title;
        this.htmlUrl = htmlUrl;
        this.createdAt = createdAt;
        this.closedAt = closedAt;
        this.openBy = openBy;
        this.body = body;
    }
    setRepositoryId(id) {
        this.id = new IssueId(id, this.id.number, this.id.githubId);
    }
    static fromGithubApi(repositoryId, data) {
        let json;
        if (typeof data === "object") {
            json = data;
        }
        else if (typeof data === "string") {
            json = JSON.parse(data);
        }
        const validator = new error_1.Validator(json);
        const id = validator.requiredNumber("id");
        const number = validator.requiredNumber("number");
        const title = validator.requiredString("title");
        const htmlUrl = validator.requiredString("html_url");
        const createdAt = validator.requiredString("created_at");
        const closedAt = validator.optionalString("closed_at");
        const openByObject = validator.requiredObject("user");
        const body = validator.optionalString("body");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        const issueId = new IssueId(repositoryId, number, id);
        const ownerId = Owner_1.OwnerId.fromGithubApi(openByObject);
        if (ownerId instanceof error_1.ValidationError) {
            return ownerId;
        }
        return new Issue(issueId, title, htmlUrl, new Date(createdAt), closedAt ? new Date(closedAt) : null, ownerId, body);
    }
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        const id = validator.requiredNumber("github_id");
        const ownerGithubId = validator.requiredNumber("github_owner_id");
        const ownerLogin = validator.requiredString("github_owner_login");
        const repositoryGithubId = validator.requiredNumber("github_repository_id");
        const repositoryName = validator.requiredString("github_repository_name");
        const number = validator.requiredNumber("github_number");
        const title = validator.requiredString("github_title");
        const htmlUrl = validator.requiredString("github_html_url");
        const createdAt = validator.requiredString("github_created_at");
        const closedAt = validator.optionalString("github_closed_at");
        const openById = validator.requiredNumber("github_open_by_owner_id");
        const openByLogin = validator.requiredString("github_open_by_owner_login");
        const body = validator.optionalString("github_body");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        const owner = new Owner_1.OwnerId(ownerLogin, ownerGithubId);
        const repositoryId = new Repository_1.RepositoryId(owner, repositoryName, repositoryGithubId);
        const issueId = new IssueId(repositoryId, number, id);
        const openByOwnerId = new Owner_1.OwnerId(openByLogin, openById);
        return new Issue(issueId, title, htmlUrl, new Date(createdAt), closedAt ? new Date(closedAt) : null, openByOwnerId, body);
    }
}
exports.Issue = Issue;
