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
const db_1 = require("../../db");
const Fixture_1 = require("../__helpers__/Fixture");
const model_1 = require("../../model");
describe("UserRepositoryRepository", () => {
    const userRepo = (0, db_1.getUserRepository)();
    const ownerRepo = (0, db_1.getOwnerRepository)();
    const repositoryRepo = (0, db_1.getRepositoryRepository)();
    const userRepositoryRepo = (0, db_1.getUserRepositoryRepository)();
    (0, jest_setup_1.setupTestDB)();
    let userId;
    const ownerId = Fixture_1.Fixture.ownerId();
    const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        userId = validUser.id;
        yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
        yield repositoryRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
    }));
    describe("create", () => {
        it("should create a new user repository record", () => __awaiter(void 0, void 0, void 0, function* () {
            const userRepository = Fixture_1.Fixture.userRepository(userId, repositoryId);
            const created = yield userRepositoryRepo.create(userRepository);
            expect(created.repositoryId).toEqual(repositoryId);
        }));
    });
    describe("getById", () => {
        it("should return the user repository by user id and repository id", () => __awaiter(void 0, void 0, void 0, function* () {
            const userRepository = Fixture_1.Fixture.userRepository(userId, repositoryId);
            yield userRepositoryRepo.create(userRepository);
            const found = yield userRepositoryRepo.getById(userId, repositoryId);
            expect(found).not.toBeNull();
            expect(found.repositoryId).toEqual(repositoryId);
        }));
    });
    describe("update", () => {
        it("should update an existing user repository record", () => __awaiter(void 0, void 0, void 0, function* () {
            const userRepository = Fixture_1.Fixture.userRepository(userId, repositoryId);
            const created = yield userRepositoryRepo.create(userRepository);
            created.repositoryUserRole = model_1.RepositoryUserRole.ADMIN;
            const updated = yield userRepositoryRepo.update(created);
            expect(updated.repositoryUserRole).toEqual(model_1.RepositoryUserRole.ADMIN);
        }));
    });
    describe("delete", () => {
        it("should delete a user repository record", () => __awaiter(void 0, void 0, void 0, function* () {
            const userRepository = Fixture_1.Fixture.userRepository(userId, repositoryId);
            yield userRepositoryRepo.create(userRepository);
            yield userRepositoryRepo.delete(userId, repositoryId);
            const found = yield userRepositoryRepo.getById(userId, repositoryId);
            expect(found).toBeNull();
        }));
    });
});
