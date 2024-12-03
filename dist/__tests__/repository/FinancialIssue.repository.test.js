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
const jest_setup_1 = require("../__helpers__/jest.setup");
const model_1 = require("../../model");
const db_1 = require("../../db/");
const Fixture_1 = require("../__helpers__/Fixture");
const FinancialIssue_repository_1 = require("../../db/FinancialIssue.repository");
const decimal_js_1 = __importDefault(require("decimal.js"));
describe("FinancialIssueRepository", () => {
    (0, jest_setup_1.setupTestDB)();
    const userRepo = (0, db_1.getUserRepository)();
    const ownerRepo = (0, db_1.getOwnerRepository)();
    const repoRepo = (0, db_1.getRepositoryRepository)();
    const issueRepo = (0, db_1.getIssueRepository)();
    const managedIssueRepo = (0, db_1.getManagedIssueRepository)();
    const issueFundingRepo = (0, db_1.getIssueFundingRepository)();
    class GitHubApiMock {
        constructor(owner, repository, issue) {
            this.owner = owner;
            this.repository = repository;
            this.issue = issue;
        }
        getOwnerAndRepository(repositoryId) {
            return __awaiter(this, void 0, void 0, function* () {
                return [this.owner, this.repository];
            });
        }
        getIssue(issueId) {
            return __awaiter(this, void 0, void 0, function* () {
                return [this.issue, this.owner];
            });
        }
    }
    let user;
    let userId;
    const ownerId1 = Fixture_1.Fixture.ownerId();
    const repositoryId1 = Fixture_1.Fixture.repositoryId(ownerId1);
    const issueId1 = Fixture_1.Fixture.issueId(repositoryId1);
    const owner1 = Fixture_1.Fixture.owner(ownerId1);
    const repository1 = Fixture_1.Fixture.repository(repositoryId1);
    const issue1 = Fixture_1.Fixture.issue(issueId1, ownerId1);
    const ownerId2 = Fixture_1.Fixture.ownerId();
    const repositoryId2 = Fixture_1.Fixture.repositoryId(ownerId2);
    const issueId2 = Fixture_1.Fixture.issueId(repositoryId2);
    const owner2 = Fixture_1.Fixture.owner(ownerId2);
    const repository2 = Fixture_1.Fixture.repository(repositoryId2);
    const issue2 = Fixture_1.Fixture.issue(issueId2, ownerId2);
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        user = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        userId = user.id;
    }));
    describe("get", () => {
        it("should return a financial issue, even if the DB is empty", () => __awaiter(void 0, void 0, void 0, function* () {
            const financialIssueRepo = (0, FinancialIssue_repository_1.getFinancialIssueRepository)(new GitHubApiMock(owner1, repository1, issue1));
            const financialIssue = yield financialIssueRepo.get(issueId1);
            const expected = new model_1.FinancialIssue(owner1, repository1, issue1, null, null, []);
            expect(financialIssue).toEqual(expected);
            /* GitHub's data was inserted in the DB*/
            yield new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second to be sure that the data is inserted in the DB (async on financialIssueRepo.get)
            const owner = yield ownerRepo.getById(ownerId1);
            expect(owner).toEqual(owner1);
            const repo = yield repoRepo.getById(repositoryId1);
            expect(repo).toEqual(repository1);
            const issue = yield issueRepo.getById(issueId1);
            expect(issue).toEqual(issue1);
        }));
    });
    describe("getAll", () => {
        it("One managedIssue issueFunding are defined for an issue", () => __awaiter(void 0, void 0, void 0, function* () {
            const financialIssueRepo = (0, FinancialIssue_repository_1.getFinancialIssueRepository)(new GitHubApiMock(owner1, repository1, issue1));
            yield ownerRepo.insertOrUpdate(owner1);
            yield repoRepo.insertOrUpdate(repository1);
            yield issueRepo.createOrUpdate(issue1);
            /* Inserting issue fundings */
            const issueFundingBody1 = {
                githubIssueId: issueId1,
                userId: userId,
                downAmount: new decimal_js_1.default(5000),
            };
            const issueFundingBody2 = {
                githubIssueId: issueId1,
                userId: userId,
                downAmount: new decimal_js_1.default(10000),
            };
            const issueFunding1 = yield issueFundingRepo.create(issueFundingBody1);
            const issueFunding2 = yield issueFundingRepo.create(issueFundingBody2);
            /* Inserting managed issues */
            const managedIssueBody = Fixture_1.Fixture.createManagedIssueBody(issueId1, userId);
            const managedIssue = yield managedIssueRepo.create(managedIssueBody);
            const financialIssuea = yield financialIssueRepo.getAll();
            const expected = new model_1.FinancialIssue(owner1, repository1, issue1, user, managedIssue, [issueFunding1, issueFunding2]);
            expect(financialIssuea).toHaveLength(1);
            expect(financialIssuea).toContainEqual(expected);
        }));
        it("One managedIssue is defined for an issue and 2 issueFunding are defined for an other issue", () => __awaiter(void 0, void 0, void 0, function* () {
            const financialIssueRepo = (0, FinancialIssue_repository_1.getFinancialIssueRepository)(new GitHubApiMock(owner1, repository1, issue1));
            yield ownerRepo.insertOrUpdate(owner1);
            yield repoRepo.insertOrUpdate(repository1);
            yield issueRepo.createOrUpdate(issue1);
            yield ownerRepo.insertOrUpdate(owner2);
            yield repoRepo.insertOrUpdate(repository2);
            yield issueRepo.createOrUpdate(issue2);
            /* Inserting issue fundings */
            const issueFundingBody1 = {
                githubIssueId: issueId1,
                userId: userId,
                downAmount: new decimal_js_1.default(5000),
            };
            const issueFundingBody2 = {
                githubIssueId: issueId1,
                userId: userId,
                downAmount: new decimal_js_1.default(10000),
            };
            const issueFunding1 = yield issueFundingRepo.create(issueFundingBody1);
            const issueFunding2 = yield issueFundingRepo.create(issueFundingBody2);
            /* Inserting managed issues */
            const managedIssueBody = Fixture_1.Fixture.createManagedIssueBody(issueId2, userId);
            const managedIssue = yield managedIssueRepo.create(managedIssueBody);
            const financialIssuea = yield financialIssueRepo.getAll();
            const expected1 = new model_1.FinancialIssue(owner1, repository1, issue1, null, null, [issueFunding1, issueFunding2]);
            const expected2 = new model_1.FinancialIssue(owner2, repository2, issue2, user, managedIssue, []);
            expect(financialIssuea).toHaveLength(2);
            expect(financialIssuea).toContainEqual(expected1);
            expect(financialIssuea).toContainEqual(expected2);
        }));
    });
});
