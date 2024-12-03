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
const jest_setup_1 = require("../../__helpers__/jest.setup");
const model_1 = require("../../../model");
const Fixture_1 = require("../../__helpers__/Fixture");
const db_1 = require("../../../db");
describe("RepositoryRepository", () => {
    const ownerRepo = (0, db_1.getOwnerRepository)();
    const repo = (0, db_1.getRepositoryRepository)();
    (0, jest_setup_1.setupTestDB)();
    describe("insertOrUpdate", () => {
        describe("insert", () => {
            it("should work", () => __awaiter(void 0, void 0, void 0, function* () {
                const ownerId = Fixture_1.Fixture.ownerId();
                yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
                const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
                const repository = Fixture_1.Fixture.repository(repositoryId);
                const created = yield repo.insertOrUpdate(repository);
                expect(created).toEqual(repository);
                const found = yield repo.getById(repository.id);
                expect(found).toEqual(repository);
            }));
            it("should fail with foreign key constraint error if owner is not inserted", () => __awaiter(void 0, void 0, void 0, function* () {
                const ownerId = Fixture_1.Fixture.ownerId();
                const repositoryId = Fixture_1.Fixture.repositoryId(ownerId); // OwnerId that does not exist in the database
                const repository = Fixture_1.Fixture.repository(repositoryId);
                try {
                    yield repo.insertOrUpdate(repository);
                    // If the insertion doesn't throw, fail the test
                    fail("Expected foreign key constraint violation, but no error was thrown.");
                }
                catch (error) {
                    // Check if the error is related to foreign key constraint
                    expect(error.message).toMatch(/violates foreign key constraint/);
                }
            }));
        });
        describe("update", () => {
            it("should work", () => __awaiter(void 0, void 0, void 0, function* () {
                const ownerId = Fixture_1.Fixture.ownerId();
                yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
                const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
                const repository = Fixture_1.Fixture.repository(repositoryId);
                yield repo.insertOrUpdate(repository);
                const updatedRepository = Fixture_1.Fixture.repository(repositoryId, "updated-payload");
                const updated = yield repo.insertOrUpdate(updatedRepository);
                expect(updated).toEqual(updatedRepository);
                const found = yield repo.getById(repository.id);
                expect(found).toEqual(updatedRepository);
            }));
        });
    });
    describe("getById", () => {
        it("should return null if repository not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            const nonExistentRepoId = Fixture_1.Fixture.repositoryId(ownerId);
            const found = yield repo.getById(nonExistentRepoId);
            expect(found).toBeNull();
        }));
        it("succeed when github ids are not given", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
            const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
            const repository = Fixture_1.Fixture.repository(repositoryId);
            yield repo.insertOrUpdate(repository);
            const undefinedOwnerId = new model_1.OwnerId(ownerId.login, undefined);
            const undefinedRepositoryId = new model_1.RepositoryId(undefinedOwnerId, repositoryId.name, undefined);
            const found = yield repo.getById(undefinedRepositoryId);
            expect(found).toEqual(repository);
        }));
    });
    describe("getAll", () => {
        it("should return all repositories", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId1 = Fixture_1.Fixture.ownerId();
            const ownerId2 = Fixture_1.Fixture.ownerId();
            yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId1));
            yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId2));
            const repositoryId1 = Fixture_1.Fixture.repositoryId(ownerId1);
            const repositoryId2 = Fixture_1.Fixture.repositoryId(ownerId2);
            const repo1 = Fixture_1.Fixture.repository(repositoryId1, "payload1");
            const repo2 = Fixture_1.Fixture.repository(repositoryId2, "payload2");
            yield repo.insertOrUpdate(repo1);
            yield repo.insertOrUpdate(repo2);
            const allRepos = yield repo.getAll();
            expect(allRepos).toHaveLength(2);
            expect(allRepos).toContainEqual(repo1);
            expect(allRepos).toContainEqual(repo2);
        }));
        it("should return an empty array if no repositories exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const allRepos = yield repo.getAll();
            expect(allRepos).toEqual([]);
        }));
    });
});
