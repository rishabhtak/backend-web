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
exports.getGitHubAPI = getGitHubAPI;
const model_1 = require("../model");
const config_1 = require("../config");
const error_1 = require("../model/error");
function getGitHubAPI() {
    return new GitHubApiImpl();
}
class GitHubApiImpl {
    getIssue(issueId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`https://api.github.com/repos/${issueId.repositoryId.ownerId.login.trim()}/${issueId.repositoryId.name.trim()}/issues/${issueId.number}`, {
                    method: "GET",
                    headers: {
                        Authorization: "Token " + config_1.config.github.requestToken,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
                if (response.ok) {
                    const json = yield response.json();
                    const issue = model_1.Issue.fromGithubApi(issueId.repositoryId, json);
                    const openBy = model_1.Owner.fromGithubApi(json.user);
                    if (issue instanceof error_1.ValidationError) {
                        config_1.logger.error(`Invalid JSON response: Issue parsing failed. URL: ${response.url}`);
                        return Promise.reject(issue);
                    }
                    else if (openBy instanceof error_1.ValidationError) {
                        config_1.logger.error(`Invalid JSON response: Owner parsing failed. URL: ${response.url}`);
                        return Promise.reject(openBy);
                    }
                    else {
                        return [issue, openBy];
                    }
                }
                else {
                    const errorDetails = `Error fetching issue: Status ${response.status} - ${response.statusText}. URL: ${response.url}`;
                    config_1.logger.error(errorDetails);
                    return Promise.reject(new Error(`Failed to fetch issue from GitHub. Status: ${response.status} - ${response.statusText}`));
                }
            }
            catch (error) {
                config_1.logger.error(`Failed to call GitHub API for getIssue: ${error}`);
                return Promise.reject(new Error("Call to GitHub API failed: " + error));
            }
        });
    }
    getOwnerAndRepository(repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`https://api.github.com/repos/${repositoryId.ownerId.login.trim()}/${repositoryId.name.trim()}`, {
                    method: "GET",
                    headers: {
                        Authorization: "Token " + config_1.config.github.requestToken,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
                if (response.ok) {
                    const json = yield response.json();
                    if (!json.owner) {
                        return Promise.reject(new Error(`Invalid JSON response: Missing owner field. URL: ${response.url}`));
                    }
                    const owner = model_1.Owner.fromGithubApi(json.owner);
                    const repo = model_1.Repository.fromGithubApi(json);
                    if (repo instanceof error_1.ValidationError) {
                        config_1.logger.error(`Invalid JSON response: Repository parsing failed. URL: ${response.url}`);
                        return Promise.reject(repo);
                    }
                    else if (owner instanceof error_1.ValidationError) {
                        config_1.logger.error(`Invalid JSON response: Owner parsing failed. URL: ${response.url}`);
                        return Promise.reject(owner);
                    }
                    else {
                        return [owner, repo];
                    }
                }
                else {
                    return Promise.reject(new Error(`Failed to fetch repository from GitHub. Status: ${response.status} - ${response.statusText}. URL: ${response.url}`));
                }
            }
            catch (error) {
                config_1.logger.error(`Failed to call GitHub API for getOwnerAndRepository: ${error}`);
                return Promise.reject(new Error("Call to GitHub API failed: " + error));
            }
        });
    }
}
