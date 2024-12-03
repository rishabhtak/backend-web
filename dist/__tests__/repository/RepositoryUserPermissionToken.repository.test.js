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
describe("RepositoryUserPermissionTokenRepository", () => {
    const ownerRepo = (0, db_1.getOwnerRepository)();
    const repositoryRepo = (0, db_1.getRepositoryRepository)();
    const tokenRepo = (0, db_1.getRepositoryUserPermissionTokenRepository)();
    (0, jest_setup_1.setupTestDB)();
    const ownerId = Fixture_1.Fixture.ownerId();
    const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
        yield repositoryRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
    }));
    describe("create", () => {
        it("should create a new token record", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createRepositoryUserPermissionTokenBody(repositoryId);
            const created = yield tokenRepo.create(tokenBody);
            expect(created).toEqual(Fixture_1.Fixture.repositoryUserPermissionTokenFromBody(created.id, tokenBody));
        }));
    });
    describe("update", () => {
        it("should update an existing token record", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createRepositoryUserPermissionTokenBody(repositoryId);
            const created = yield tokenRepo.create(tokenBody);
            const updatedTokenBody = Object.assign(Object.assign({}, tokenBody), { userGithubOwnerLogin: "updatedUser" });
            const updated = yield tokenRepo.update(Fixture_1.Fixture.repositoryUserPermissionTokenFromBody(created.id, updatedTokenBody));
            expect(updated).toEqual(Fixture_1.Fixture.repositoryUserPermissionTokenFromBody(created.id, updatedTokenBody));
        }));
    });
    describe("getById", () => {
        it("should return null if token not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentTokenId = new model_1.RepositoryUserPermissionTokenId(Fixture_1.Fixture.uuid());
            const found = yield tokenRepo.getById(nonExistentTokenId);
            expect(found).toBeNull();
        }));
        it("should return token by id", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createRepositoryUserPermissionTokenBody(repositoryId);
            const created = yield tokenRepo.create(tokenBody);
            const found = yield tokenRepo.getById(created.id);
            expect(found).toEqual(created);
        }));
    });
    describe("getByRepositoryId", () => {
        it("should return tokens for a specific repository", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createRepositoryUserPermissionTokenBody(repositoryId);
            yield tokenRepo.create(tokenBody);
            const found = yield tokenRepo.getByRepositoryId(repositoryId);
            expect(found.length).toBeGreaterThan(0);
            expect(found[0].repositoryId).toEqual(repositoryId);
        }));
    });
    describe("getByToken", () => {
        it("should return token by token value", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createRepositoryUserPermissionTokenBody(repositoryId);
            const created = yield tokenRepo.create(tokenBody);
            const found = yield tokenRepo.getByToken(created.token);
            expect(found).toEqual(created);
        }));
    });
    describe("getAll", () => {
        it("should return all tokens", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody1 = Fixture_1.Fixture.createRepositoryUserPermissionTokenBody(repositoryId);
            const tokenBody2 = Fixture_1.Fixture.createRepositoryUserPermissionTokenBody(repositoryId);
            yield tokenRepo.create(tokenBody1);
            yield tokenRepo.create(tokenBody2);
            const allTokens = yield tokenRepo.getAll();
            expect(allTokens.length).toBeGreaterThanOrEqual(2);
        }));
    });
    describe("delete", () => {
        it("should delete a token by token value", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createRepositoryUserPermissionTokenBody(repositoryId);
            const created = yield tokenRepo.create(tokenBody);
            yield tokenRepo.delete(created.token);
            const found = yield tokenRepo.getByToken(created.token);
            expect(found).toBeNull();
        }));
    });
});
