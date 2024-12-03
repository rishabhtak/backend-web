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
exports.getFinancialIssueRepository = getFinancialIssueRepository;
const model_1 = require("../model");
const dbPool_1 = require("../dbPool");
const github_1 = require("./github");
const ManagedIssue_repository_1 = require("./ManagedIssue.repository");
const IssueFunding_repository_1 = require("./IssueFunding.repository");
const services_1 = require("../services");
const config_1 = require("../config");
const User_repository_1 = require("./User.repository");
function getFinancialIssueRepository(gitHubApi = (0, services_1.getGitHubAPI)()) {
    return new FinancialIssueRepositoryImpl((0, dbPool_1.getPool)(), gitHubApi);
}
class FinancialIssueRepositoryImpl {
    constructor(pool, githubService = (0, services_1.getGitHubAPI)()) {
        this.ownerRepo = (0, github_1.getOwnerRepository)();
        this.repoRepo = (0, github_1.getRepositoryRepository)();
        this.issueRepo = (0, github_1.getIssueRepository)();
        this.userRepo = (0, User_repository_1.getUserRepository)();
        this.managedIssueRepo = (0, ManagedIssue_repository_1.getManagedIssueRepository)();
        this.issueFundingRepo = (0, IssueFunding_repository_1.getIssueFundingRepository)();
        this.pool = pool;
        this.githubService = githubService;
    }
    getRepository(repositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const githubRepoPromise = this.githubService.getOwnerAndRepository(repositoryId);
            githubRepoPromise
                .then((_a) => __awaiter(this, [_a], void 0, function* ([owner, repo]) {
                this.ownerRepo
                    .insertOrUpdate(owner)
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.repoRepo.insertOrUpdate(repo);
                }))
                    .catch((error) => {
                    config_1.logger.error("Error updating the DB", error);
                });
                return [owner, repo];
            }))
                .catch((error) => {
                config_1.logger.error("Error fetching GitHub data:", error);
                return null;
            });
            const owner = yield this.ownerRepo
                .getById(repositoryId.ownerId)
                .then((owner) => __awaiter(this, void 0, void 0, function* () {
                if (!owner) {
                    const [owner, _] = yield githubRepoPromise;
                    return owner;
                }
                return owner;
            }))
                .catch((error) => {
                config_1.logger.error(`Owner ${repositoryId.ownerId.toString()} does not exist in the DB and go an error fetching GitHub data:`, error);
                return null;
            });
            const repo = yield this.repoRepo
                .getById(repositoryId)
                .then((repo) => __awaiter(this, void 0, void 0, function* () {
                if (!repo) {
                    const [_, repo] = yield githubRepoPromise;
                    return repo;
                }
                return repo;
            }))
                .catch((error) => {
                config_1.logger.error(`Repository ${repositoryId.toString()} does not exist in the DB and go an error fetching GitHub data:`, error);
                return null;
            });
            if (owner && repo) {
                return [owner, repo];
            }
            else {
                throw new Error(`Failed to fetch all required data for repository ${JSON.stringify(repositoryId)}`);
            }
        });
    }
    get(issueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const githubRepoPromise = this.githubService.getOwnerAndRepository(issueId.repositoryId);
            const githubIssuePromise = this.githubService.getIssue(issueId);
            Promise.all([githubRepoPromise, githubIssuePromise])
                .then((_a) => __awaiter(this, [_a], void 0, function* ([repoResult, issueResult]) {
                const [owner, repo] = repoResult;
                const [issue, issueCreatedBy] = issueResult;
                yield this.ownerRepo
                    .insertOrUpdate(owner)
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.repoRepo.insertOrUpdate(repo);
                }))
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.ownerRepo.insertOrUpdate(issueCreatedBy);
                }))
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    const i = issue;
                    i.setRepositoryId(repo.id); // TODO: not very elegant way to deal with the fact that github query doesn't return repository id nor owner id
                    yield this.issueRepo.createOrUpdate(i);
                }));
            }))
                .catch((error) => {
                config_1.logger.error("Error fetching GitHub data:", error);
            });
            const owner = this.ownerRepo
                .getById(issueId.repositoryId.ownerId)
                .then((owner) => __awaiter(this, void 0, void 0, function* () {
                if (!owner) {
                    const [owner, _] = yield githubRepoPromise;
                    return owner;
                }
                return owner;
            }))
                .catch((error) => {
                config_1.logger.error(`Issue owner ${JSON.stringify(issueId)} does not exist in the DB and go an error fetching GitHub data:`, error);
                return null;
            });
            const repo = this.repoRepo
                .getById(issueId.repositoryId)
                .then((repo) => __awaiter(this, void 0, void 0, function* () {
                if (!repo) {
                    const [_, repo] = yield githubRepoPromise;
                    return repo;
                }
                return repo;
            }))
                .catch((error) => {
                config_1.logger.error(`Issue repository ${JSON.stringify(issueId)} does not exist in the DB and go an error fetching GitHub data:`, error);
                return null;
            });
            const issue = this.issueRepo
                .getById(issueId)
                .then((issue) => __awaiter(this, void 0, void 0, function* () {
                if (!issue) {
                    const [issue, _] = yield githubIssuePromise;
                    return issue;
                }
                return issue;
            }))
                .catch((error) => {
                config_1.logger.error(`Issue ${JSON.stringify(issueId)} does not exist in the DB and go an error fetching GitHub data:`, error);
                return null;
            });
            const managedIssue = this.managedIssueRepo.getByIssueId(issueId);
            const issueManager = managedIssue
                .then((managedIssue) => {
                if (!managedIssue) {
                    return null;
                }
                else {
                    return this.userRepo.getById(managedIssue.managerId);
                }
            })
                .catch((error) => {
                config_1.logger.error(`Got an error fetching the manager for managed issue for issue ${JSON.stringify(issueId)}:`, error);
                return null;
            });
            const o = yield owner;
            const r = yield repo;
            const i = yield issue;
            if (o && r && i) {
                const issueFundings = this.issueFundingRepo.getAll(issueId);
                return new model_1.FinancialIssue(o, r, i, yield issueManager, yield managedIssue, yield issueFundings);
            }
            else {
                throw new Error(`Failed to fetch all required data for managed issue ${JSON.stringify(issueId)}`);
            }
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const allManagedIssues = yield this.managedIssueRepo.getAll();
            config_1.logger.debug(`Got ${allManagedIssues.length} managed issues from the DB`);
            const managedIssues = new Map(allManagedIssues.map((m) => {
                var _a;
                if (!m.githubIssueId || !m.githubIssueId.githubId) {
                    config_1.logger.error(`ManagedIssue of github issue id: ${m.githubIssueId}, does not have a githubId field defined in the DB`);
                }
                return [(_a = m.githubIssueId) === null || _a === void 0 ? void 0 : _a.githubId, m];
            }));
            const issueFundings = new Map();
            const allIssueFundings = yield this.issueFundingRepo.getAll();
            config_1.logger.debug(`Got ${allIssueFundings.length} issue fundings from the DB`);
            allIssueFundings.forEach((i) => {
                var _a, _b;
                const githubId = (_a = i.githubIssueId) === null || _a === void 0 ? void 0 : _a.githubId;
                if (!githubId) {
                    // TODO: fix this mess with optional githubId
                    config_1.logger.error(`IssueFunding of github issue id: ${i.githubIssueId}, does not have a githubId field defined in the DB`);
                    return; // Skip if githubId is undefined
                }
                // Initialize an empty array if the key doesn't exist
                if (!issueFundings.has(githubId)) {
                    issueFundings.set(githubId, []);
                }
                // Add the IssueFunding to the corresponding array
                (_b = issueFundings.get(githubId)) === null || _b === void 0 ? void 0 : _b.push(i);
            });
            const issueIds = new Map();
            allManagedIssues.forEach((m) => {
                var _a;
                const githubId = (_a = m.githubIssueId) === null || _a === void 0 ? void 0 : _a.githubId;
                if (githubId !== undefined) {
                    // Add to the map if the key doesn't already exist
                    if (!issueIds.has(githubId)) {
                        issueIds.set(githubId, m.githubIssueId);
                    }
                }
            });
            allIssueFundings.forEach((i) => {
                var _a;
                const githubId = (_a = i.githubIssueId) === null || _a === void 0 ? void 0 : _a.githubId;
                if (githubId !== undefined) {
                    // Add to the map if the key doesn't already exist
                    if (!issueIds.has(githubId)) {
                        issueIds.set(githubId, i.githubIssueId);
                    }
                }
            });
            const financialIssues = [];
            for (const [githubId, issueId] of issueIds) {
                if (!githubId) {
                    config_1.logger.error(`Issue with github id: ${issueId}, does not have an id field defined in the DB`);
                    continue; // Skip if githubId is undefined
                }
                const managedIssue = (_a = managedIssues.get(githubId)) !== null && _a !== void 0 ? _a : null;
                let issueManager = null;
                if (managedIssue !== null) {
                    issueManager = yield this.userRepo.getById(managedIssue.managerId);
                }
                const fundings = (_b = issueFundings.get(githubId)) !== null && _b !== void 0 ? _b : [];
                const owner = yield this.ownerRepo.getById(issueId.repositoryId.ownerId);
                const repo = yield this.repoRepo.getById(issueId.repositoryId);
                const issue = yield this.issueRepo.getById(issueId);
                if (!owner || !repo || !issue) {
                    config_1.logger.error(`Financial issue with github id: ${githubId}, does not have a valid owner, repo, or issue in the DB`);
                    continue; // Use continue to skip to the next iteration
                }
                financialIssues.push(new model_1.FinancialIssue(owner, repo, issue, issueManager, managedIssue, fundings));
            }
            return financialIssues;
        });
    }
}
