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
const jest_setup_1 = require("../__helpers__/jest.setup");
const model_1 = require("../../model");
const db_1 = require("../../db/");
const Fixture_1 = require("../__helpers__/Fixture");
const uuid_1 = require("uuid");
describe("ManagedIssueRepository", () => {
    const userRepo = (0, db_1.getUserRepository)();
    const ownerRepo = (0, db_1.getOwnerRepository)();
    const repoRepo = (0, db_1.getRepositoryRepository)();
    const issueRepo = (0, db_1.getIssueRepository)();
    const managedIssueRepo = (0, db_1.getManagedIssueRepository)();
    (0, jest_setup_1.setupTestDB)();
    let validUserId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        validUserId = validUser.id;
    }));
    describe("create", () => {
        it("should create a new managed issue record", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
            const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
            yield repoRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
            const issueId = Fixture_1.Fixture.issueId(repositoryId);
            const issue = Fixture_1.Fixture.issue(issueId, ownerId);
            yield issueRepo.createOrUpdate(issue);
            const managedIssueBody = Fixture_1.Fixture.createManagedIssueBody(issueId, validUserId);
            const created = yield managedIssueRepo.create(managedIssueBody);
            expect(created).toEqual(Fixture_1.Fixture.managedIssueFromBody(created.id, managedIssueBody));
            const found = yield managedIssueRepo.getById(new model_1.ManagedIssueId(created.id.uuid));
            expect(found).toEqual(created);
        }));
        // Add more test cases for `create`:
        // - Test with invalid data (e.g., negative amount, invalid enum values)
        // - Verify error handling and database constraints
    });
    describe("update", () => {
        it("should update an existing managed issue record", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
            const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
            yield repoRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
            const issueId = Fixture_1.Fixture.issueId(repositoryId);
            const issue = Fixture_1.Fixture.issue(issueId, ownerId);
            yield issueRepo.createOrUpdate(issue);
            const managedIssueBody = Fixture_1.Fixture.createManagedIssueBody(issueId, validUserId);
            const created = yield managedIssueRepo.create(managedIssueBody);
            expect(created).toEqual(Fixture_1.Fixture.managedIssueFromBody(created.id, managedIssueBody));
            const updatedManagedIssueBody = Object.assign(Object.assign({}, managedIssueBody), { state: model_1.ManagedIssueState.SOLVED });
            const updated = yield managedIssueRepo.update(Fixture_1.Fixture.managedIssueFromBody(created.id, updatedManagedIssueBody));
            expect(created.id).toEqual(updated.id);
            expect(updated).toEqual(Fixture_1.Fixture.managedIssueFromBody(created.id, updatedManagedIssueBody));
            const found = yield managedIssueRepo.getById(updated.id);
            expect(found).toEqual(updated);
        }));
        // Add more test cases for `update`:
        // - Test updating different fields
        // - Test updating a non-existent record
        // - Verify error handling and database constraints
    });
    describe("getById", () => {
        it("should return null if managed issue not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentManagedIssueId = new model_1.ManagedIssueId((0, uuid_1.v4)());
            const found = yield managedIssueRepo.getById(nonExistentManagedIssueId);
            expect(found).toBeNull();
        }));
        // Add more test cases for `getById`:
        // - Test retrieving an existing record
    });
});
