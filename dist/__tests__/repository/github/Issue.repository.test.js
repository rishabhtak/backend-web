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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_setup_1 = require("../../__helpers__/jest.setup");
const Fixture_1 = require("../../__helpers__/Fixture");
const db_1 = require("../../../db");
const model_1 = require("../../../model");
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../../../config");
describe("IssueRepository", () => {
    (0, jest_setup_1.setupTestDB)();
    const ownerRepo = (0, db_1.getOwnerRepository)();
    const repoRepo = (0, db_1.getRepositoryRepository)();
    const issueRepo = (0, db_1.getIssueRepository)();
    describe("insertOrUpdate", () => {
        describe("insert", () => {
            it("should work", () => __awaiter(void 0, void 0, void 0, function* () {
                const ownerId = Fixture_1.Fixture.ownerId();
                yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
                const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
                yield repoRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
                const issueId = Fixture_1.Fixture.issueId(repositoryId);
                const issue = Fixture_1.Fixture.issue(issueId, ownerId);
                const created = yield issueRepo.createOrUpdate(issue);
                expect(created).toEqual(issue);
                const found = yield issueRepo.getById(issue.id);
                expect(found).toEqual(issue);
            }));
            it("should fail with foreign key constraint error if repository or owner is not inserted", () => __awaiter(void 0, void 0, void 0, function* () {
                const ownerId = Fixture_1.Fixture.ownerId();
                const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
                const issueId = Fixture_1.Fixture.issueId(repositoryId);
                const issue = Fixture_1.Fixture.issue(issueId, ownerId);
                try {
                    yield issueRepo.createOrUpdate(issue);
                    // If the insertion doesn't throw, fail the test
                    fail("Expected foreign key constraint violation, but no error was thrown.");
                }
                catch (error) {
                    // Check if the error is related to foreign key constraint
                    expect(error.message).toMatch(/violates foreign key constraint/);
                }
            }));
            it("should work with real GitHub data", () => __awaiter(void 0, void 0, void 0, function* () {
                const ownerData = fs_1.default.readFileSync(`src/__tests__/__data__/github/owner-org.json`, "utf8");
                const repoData = fs_1.default.readFileSync(`src/__tests__/__data__/github/repository.json`, "utf8");
                const issueData = fs_1.default.readFileSync(`src/__tests__/__data__/github/issue.json`, "utf8");
                const owner = model_1.Owner.fromGithubApi(ownerData);
                const repository = model_1.Repository.fromGithubApi(repoData);
                if (owner instanceof Error) {
                    config_1.logger.error(owner);
                    fail("Owner parsing failed");
                }
                else if (repository instanceof Error) {
                    config_1.logger.error(repository);
                    fail("Repository parsing failed");
                }
                else {
                    const issue = model_1.Issue.fromGithubApi(repository.id, issueData);
                    const openBy = model_1.Owner.fromGithubApi(JSON.parse(issueData).user);
                    if (issue instanceof Error) {
                        config_1.logger.error(issue);
                        fail(issue);
                    }
                    else if (openBy instanceof Error) {
                        config_1.logger.error(openBy);
                        fail(openBy);
                    }
                    else {
                        yield ownerRepo.insertOrUpdate(owner);
                        yield repoRepo.insertOrUpdate(repository);
                        yield ownerRepo.insertOrUpdate(openBy);
                        const created = yield issueRepo.createOrUpdate(issue);
                        expect(created).toBeInstanceOf(model_1.Issue);
                    }
                }
            }));
        });
        describe("update", () => {
            it("should work", () => __awaiter(void 0, void 0, void 0, function* () {
                const ownerId = Fixture_1.Fixture.ownerId();
                yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
                const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
                yield repoRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
                const issueId = Fixture_1.Fixture.issueId(repositoryId);
                const issue = Fixture_1.Fixture.issue(issueId, ownerId);
                yield issueRepo.createOrUpdate(issue);
                const updatedIssue = Fixture_1.Fixture.issue(issueId, ownerId, "updated-payload");
                const updated = yield issueRepo.createOrUpdate(updatedIssue);
                expect(updated).toEqual(updatedIssue);
                const found = yield issueRepo.getById(issue.id);
                expect(found).toEqual(updatedIssue);
            }));
        });
    });
    describe("getById", () => {
        it("should return null if issue not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
            const nonExistentIssueId = Fixture_1.Fixture.issueId(repositoryId);
            const found = yield issueRepo.getById(nonExistentIssueId);
            expect(found).toBeNull();
        }));
        it("succeed when github ids are not given", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
            const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
            yield repoRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
            const issueId = Fixture_1.Fixture.issueId(repositoryId);
            const issue = Fixture_1.Fixture.issue(issueId, ownerId);
            yield issueRepo.createOrUpdate(issue);
            const undefinedOwnerId = new model_1.OwnerId(ownerId.login, undefined);
            const undefinedRepositoryId = new model_1.RepositoryId(undefinedOwnerId, repositoryId.name, undefined);
            const undefinedIssueId = new model_1.IssueId(undefinedRepositoryId, issueId.number, undefined);
            const found = yield issueRepo.getById(undefinedIssueId);
            expect(found).toEqual(issue);
        }));
    });
    describe("getAll", () => {
        it("should return all issues", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
            const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
            yield repoRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
            const issueId1 = Fixture_1.Fixture.issueId(repositoryId);
            const issueId2 = Fixture_1.Fixture.issueId(repositoryId);
            const issue1 = Fixture_1.Fixture.issue(issueId1, ownerId);
            const issue2 = Fixture_1.Fixture.issue(issueId2, ownerId);
            yield issueRepo.createOrUpdate(issue1);
            yield issueRepo.createOrUpdate(issue2);
            const allIssues = yield issueRepo.getAll();
            expect(allIssues).toHaveLength(2);
            expect(allIssues).toContainEqual(issue1);
            expect(allIssues).toContainEqual(issue2);
        }));
        it("should return an empty array if no issues exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const allIssues = yield issueRepo.getAll();
            expect(allIssues).toEqual([]);
        }));
    });
});
