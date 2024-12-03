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
const db_1 = require("../../db/");
const Fixture_1 = require("../__helpers__/Fixture");
const decimal_js_1 = __importDefault(require("decimal.js"));
describe("IssueFundingRepository", () => {
    const userRepo = (0, db_1.getUserRepository)();
    const ownerRepo = (0, db_1.getOwnerRepository)();
    const repoRepo = (0, db_1.getRepositoryRepository)();
    const issueRepo = (0, db_1.getIssueRepository)();
    const issueFundingRepo = (0, db_1.getIssueFundingRepository)();
    (0, jest_setup_1.setupTestDB)();
    let validUserId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        validUserId = validUser.id;
    }));
    describe("create", () => {
        it("should create a new issue funding record", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
            const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
            yield repoRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
            const issueId = Fixture_1.Fixture.issueId(repositoryId);
            const issue = Fixture_1.Fixture.issue(issueId, ownerId);
            yield issueRepo.createOrUpdate(issue);
            const issueFundingBody = {
                githubIssueId: issueId,
                userId: validUserId,
                downAmount: new decimal_js_1.default(5000),
            };
            expect(true).toEqual(true);
            const created = yield issueFundingRepo.create(issueFundingBody);
            expect(created).toEqual(Fixture_1.Fixture.issueFundingFromBody(created.id, issueFundingBody));
            const found = yield issueFundingRepo.getById(created.id);
            expect(found).toEqual(created);
        }));
        // Add more test cases for `create`:
        // - Test with invalid data (e.g., negative amount)
        // - Verify error handling and database constraints
    });
    describe("getById", () => {
        it("should return null if issue funding not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentIssueFundingId = Fixture_1.Fixture.issueFundingId();
            const found = yield issueFundingRepo.getById(nonExistentIssueFundingId);
            expect(found).toBeNull();
        }));
    });
    describe("getAll", () => {
        it("should return an empty array if no issue fundings exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const allIssueFundings = yield issueFundingRepo.getAll();
            expect(allIssueFundings).toEqual([]);
        }));
        it("should return all issue fundings", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
            const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
            yield repoRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
            const issueId = Fixture_1.Fixture.issueId(repositoryId);
            const issue = Fixture_1.Fixture.issue(issueId, ownerId);
            yield issueRepo.createOrUpdate(issue);
            const issueFundingBody1 = {
                githubIssueId: issueId,
                userId: validUserId,
                downAmount: new decimal_js_1.default(5000),
            };
            const issueFundingBody2 = {
                githubIssueId: issueId,
                userId: validUserId,
                downAmount: new decimal_js_1.default(10000),
            };
            const issueFunding1 = yield issueFundingRepo.create(issueFundingBody1);
            const issueFunding2 = yield issueFundingRepo.create(issueFundingBody2);
            const allIssueFundings = yield issueFundingRepo.getAll();
            expect(allIssueFundings).toHaveLength(2);
            expect(allIssueFundings).toContainEqual(Fixture_1.Fixture.issueFundingFromBody(issueFunding1.id, issueFundingBody1));
            expect(allIssueFundings).toContainEqual(Fixture_1.Fixture.issueFundingFromBody(issueFunding2.id, issueFundingBody2));
        }));
    });
});
