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
const Fixture_1 = require("../__helpers__/Fixture");
const db_1 = require("../../db/");
describe("UserRepository", () => {
    (0, jest_setup_1.setupTestDB)();
    const repo = (0, db_1.getUserRepository)();
    describe("insertLocal", () => {
        it("should create and return a local user", () => __awaiter(void 0, void 0, void 0, function* () {
            const userBody = Fixture_1.Fixture.localUser();
            const created = yield repo.insert(Fixture_1.Fixture.createUser(userBody));
            expect(created.data).toBeInstanceOf(model_1.LocalUser);
            if (created.data instanceof model_1.LocalUser) {
                expect(created.data.email).toBe(userBody.email);
                expect(created.name).toBe(null);
                expect(created.data.isEmailVerified).toBe(false);
                expect(created.data.password).toBeDefined();
            }
            const found = yield repo.getById(created.id);
            expect(found).toEqual(created);
        }));
    });
    describe("insertGithub", () => {
        it("should create and return a Github user", () => __awaiter(void 0, void 0, void 0, function* () {
            const thirdPartyUser = Fixture_1.Fixture.thirdPartyUser("1");
            const created = yield repo.insert(Fixture_1.Fixture.createUser(thirdPartyUser));
            expect(created.data).toBeInstanceOf(model_1.ThirdPartyUser);
            if (created.data instanceof model_1.ThirdPartyUser) {
                expect(created.data).toEqual(thirdPartyUser);
            }
            expect(created.role).toBe(model_1.UserRole.USER);
            const found = yield repo.getById(created.id);
            expect(found).toEqual(created);
        }));
        it("should throw an error for non-Github providers", () => __awaiter(void 0, void 0, void 0, function* () {
            const thirdPartyUser = Fixture_1.Fixture.thirdPartyUser("1", "invalid_provider");
            yield expect(repo.insert(Fixture_1.Fixture.createUser(thirdPartyUser))).rejects.toThrow("Invalid provider, was expecting Github");
        }));
    });
    describe("validateEmail", () => {
        it("should return null if user not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield repo.validateEmail("bonjour");
            expect(user).toBeNull();
        }));
        it("should update the email", () => __awaiter(void 0, void 0, void 0, function* () {
            const userBody = Fixture_1.Fixture.localUser();
            yield repo.insert(Fixture_1.Fixture.createUser(userBody));
            const user = yield repo.validateEmail(userBody.email);
            expect(user).toBeDefined();
            expect(user.data).toBeInstanceOf(model_1.LocalUser);
            if (user.data instanceof model_1.LocalUser) {
                expect(user.data.email).toBe(userBody.email);
                expect(user.name).toBe(null);
                expect(user.data.isEmailVerified).toBe(true);
                expect(user.data.password).toBeDefined();
            }
            const found = yield repo.getById(user.id);
            expect(found).toEqual(user);
        }));
    });
    describe("getById", () => {
        it("should return null if user not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentUserId = Fixture_1.Fixture.userId();
            const found = yield repo.getById(nonExistentUserId);
            expect(found).toBeNull();
        }));
    });
    describe("getAll", () => {
        it("should return an empty array if no users exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const allUsers = yield repo.getAll();
            expect(allUsers).toEqual([]);
        }));
        it("should return all users", () => __awaiter(void 0, void 0, void 0, function* () {
            const user1 = Fixture_1.Fixture.localUser();
            const user2 = Fixture_1.Fixture.thirdPartyUser("1");
            const created = yield repo.insert(Fixture_1.Fixture.createUser(user1));
            yield repo.insert(Fixture_1.Fixture.createUser(user2));
            const allUsers = yield repo.getAll();
            expect(allUsers).toHaveLength(2);
        }));
    });
    describe("findOne", () => {
        it("should find a local user by email", () => __awaiter(void 0, void 0, void 0, function* () {
            const userBody = Fixture_1.Fixture.localUser();
            const created = yield repo.insert(Fixture_1.Fixture.createUser(userBody));
            expect(created.data).toBeInstanceOf(model_1.LocalUser);
            if (created.data instanceof model_1.LocalUser) {
                expect(created.data.email).toBe(userBody.email);
                expect(created.name).toBe(null);
                expect(created.data.isEmailVerified).toBe(false);
                expect(created.data.password).toBeDefined();
            }
            const found = yield repo.findOne(userBody.email);
            expect(found).toEqual(created);
        }));
        it("should find a github user by email", () => __awaiter(void 0, void 0, void 0, function* () {
            const thirdPartyUser = Fixture_1.Fixture.thirdPartyUser("1");
            const created = yield repo.insert(Fixture_1.Fixture.createUser(thirdPartyUser));
            expect(created.data).toBeInstanceOf(model_1.ThirdPartyUser);
            if (created.data instanceof model_1.ThirdPartyUser) {
                expect(created.data).toEqual(thirdPartyUser);
            }
            expect(created.role).toBe(model_1.UserRole.USER);
            const found = yield repo.findOne(thirdPartyUser.email);
            expect(found).toEqual(created);
        }));
        it("should return null if user not found by email", () => __awaiter(void 0, void 0, void 0, function* () {
            const found = yield repo.findOne("nonexistentemail@example.com");
            expect(found).toBeNull();
        }));
    });
    describe("findByThirdPartyId", () => {
        it("should find a user by third-party ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const thirdPartyUser = Fixture_1.Fixture.thirdPartyUser("1");
            const created = yield repo.insert(Fixture_1.Fixture.createUser(thirdPartyUser));
            expect(created.data).toBeInstanceOf(model_1.ThirdPartyUser);
            if (created.data instanceof model_1.ThirdPartyUser) {
                expect(created.data).toEqual(thirdPartyUser);
            }
            expect(created.role).toBe(model_1.UserRole.USER);
            const foundByThirdPartyId = yield repo.findByThirdPartyId(thirdPartyUser.id, thirdPartyUser.provider);
            expect(foundByThirdPartyId).toEqual(created);
        }));
        it("should return null if user not found by third-party ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentThirdPartyId = new model_1.ThirdPartyUserId("nonexistentid");
            const found = yield repo.findByThirdPartyId(nonExistentThirdPartyId, model_1.Provider.Github);
            expect(found).toBeNull();
        }));
    });
});
