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
const db_1 = require("../../db");
const Fixture_1 = require("../__helpers__/Fixture");
describe("CompanyUserPermissionTokenRepository", () => {
    const companyRepo = (0, db_1.getCompanyRepository)();
    const tokenRepo = (0, db_1.getCompanyUserPermissionTokenRepository)();
    (0, jest_setup_1.setupTestDB)();
    let companyId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const company = yield companyRepo.create(Fixture_1.Fixture.createCompanyBody());
        companyId = company.id;
    }));
    describe("create", () => {
        it("should create a new token record", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createUserCompanyPermissionTokenBody("test@example.com", companyId);
            const created = yield tokenRepo.create(tokenBody);
            expect(created).toEqual(Fixture_1.Fixture.userCompanyPermissionTokenFromBody(created.id, tokenBody));
            const found = yield tokenRepo.getById(created.id);
            expect(found).toEqual(created);
        }));
        // Add more test cases for `create`
    });
    describe("update", () => {
        it("should update an existing token record", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createUserCompanyPermissionTokenBody("test@example.com", companyId);
            const created = yield tokenRepo.create(tokenBody);
            expect(created).toEqual(Fixture_1.Fixture.userCompanyPermissionTokenFromBody(created.id, tokenBody));
            const updatedTokenBody = Object.assign(Object.assign({}, tokenBody), { userEmail: "updated@example.com" });
            const updated = yield tokenRepo.update(Fixture_1.Fixture.userCompanyPermissionTokenFromBody(created.id, updatedTokenBody));
            expect(created.id).toEqual(updated.id);
            expect(updated.userEmail).toEqual("updated@example.com");
        }));
        // Add more test cases for `update`
    });
    describe("getById", () => {
        it("should return null if token not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentTokenId = new model_1.CompanyUserPermissionTokenId(Fixture_1.Fixture.uuid());
            const found = yield tokenRepo.getById(nonExistentTokenId);
            expect(found).toBeNull();
        }));
        // Add more test cases for `getById`
    });
    describe("getByUserEmail", () => {
        it("should return tokens for a specific user email", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createUserCompanyPermissionTokenBody("test@example.com", companyId);
            yield tokenRepo.create(tokenBody);
            const found = yield tokenRepo.getByUserEmail("test@example.com", companyId);
            expect(found.length).toBeGreaterThan(0);
            expect(found[0].userEmail).toEqual("test@example.com");
        }));
        // Add more test cases for `getByUserEmail`
    });
    describe("getByToken", () => {
        it("should return token", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createUserCompanyPermissionTokenBody("test@example.com", companyId);
            const created = yield tokenRepo.create(tokenBody);
            const found = yield tokenRepo.getByToken(created.token);
            expect(found).toEqual(created);
        }));
        // Add more test cases for `getByToken`
    });
    describe("delete", () => {
        it("should should", () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenBody = Fixture_1.Fixture.createUserCompanyPermissionTokenBody("test@example.com", companyId);
            const created = yield tokenRepo.create(tokenBody);
            const found = yield tokenRepo.getByToken(created.token);
            expect(found).toEqual(created);
            yield tokenRepo.delete(created.token);
            const notFound = yield tokenRepo.getByToken(created.token);
            expect(notFound).toBe(null);
        }));
    });
});
