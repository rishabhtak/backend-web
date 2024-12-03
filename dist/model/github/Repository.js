"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = exports.RepositoryId = void 0;
const error_1 = require("../error");
const Owner_1 = require("./Owner");
class RepositoryId {
    constructor(ownerId, name, githubId) {
        this.ownerId = ownerId;
        this.name = name;
        this.githubId = githubId;
    }
    ownerLogin() {
        return this.ownerId.login;
    }
    static fromGithubApi(data) {
        let json;
        if (typeof data === "object") {
            json = data;
        }
        else if (typeof data === "string") {
            json = JSON.parse(data);
        }
        const validator = new error_1.Validator(json);
        const name = validator.requiredString("name");
        const id = validator.requiredNumber("id");
        if (!json.owner) {
            return new error_1.ValidationError("Owner field is missing in the JSON response.", json);
        }
        const ownerId = Owner_1.OwnerId.fromGithubApi(json.owner);
        if (ownerId instanceof error_1.ValidationError) {
            return ownerId;
        }
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new RepositoryId(ownerId, name, id);
    }
    static fromBackendPrimaryKey(row) {
        return RepositoryId.fromAny(row, "github_name", "github_id");
    }
    static fromBackendForeignKey(row) {
        return RepositoryId.fromAny(row, "github_repository_name", "github_repository_id");
    }
    static fromAny(data, nameKey, idKey) {
        const ownerId = Owner_1.OwnerId.fromBackendForeignKey(data);
        if (ownerId instanceof error_1.ValidationError) {
            return ownerId;
        }
        const validator = new error_1.Validator(data);
        const name = validator.requiredString(nameKey);
        const id = validator.requiredNumber(idKey);
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new RepositoryId(ownerId, name, id);
    }
}
exports.RepositoryId = RepositoryId;
class Repository {
    constructor(id, htmlUrl, description) {
        this.id = id;
        this.htmlUrl = htmlUrl;
        this.description = description;
    }
    // Github API: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
    // Example:
    // Repo owned by an organization: https://api.github.com/repos/open-source-economy/frontend
    // Repo owned by a user: https://api.github.com/repos/laurianemollier/strongVerbes
    //
    // NOTE: Repo can be queried by owner id and repository id.
    // This does not work: https://api.github.com/repos/141809657/701996033
    // But that works: https://api.github.com/repositories/701996033
    // See discussion: https://github.com/octokit/octokit.rb/issues/483
    static fromGithubApi(data) {
        let json;
        if (typeof data === "object") {
            json = data;
        }
        else if (typeof data === "string") {
            json = JSON.parse(data);
        }
        const repositoryId = RepositoryId.fromGithubApi(json);
        if (repositoryId instanceof error_1.ValidationError) {
            return repositoryId;
        }
        const validator = new error_1.Validator(json);
        const htmlUrl = validator.requiredString("html_url");
        const description = validator.optionalString("description");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new Repository(repositoryId, htmlUrl, description);
    }
    static fromBackend(json) {
        const repositoryId = RepositoryId.fromBackendPrimaryKey(json);
        if (repositoryId instanceof error_1.ValidationError) {
            return repositoryId;
        }
        const validator = new error_1.Validator(json);
        const htmlUrl = validator.requiredString("github_html_url");
        const description = validator.optionalString("github_description");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new Repository(repositoryId, htmlUrl, description);
    }
}
exports.Repository = Repository;
