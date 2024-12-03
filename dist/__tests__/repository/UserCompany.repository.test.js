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
describe("UserCompanyRepository", () => {
    const userRepo = (0, db_1.getUserRepository)();
    const companyRepo = (0, db_1.getCompanyRepository)();
    const userCompanyRepo = (0, db_1.getUserCompanyRepository)();
    (0, jest_setup_1.setupTestDB)();
    let validUserId;
    let validCompanyId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        validUserId = validUser.id;
        const companyBody = Fixture_1.Fixture.createCompanyBody();
        const createdCompany = yield companyRepo.create(companyBody);
        validCompanyId = createdCompany.id;
    }));
    describe("insert", () => {
        it("should insert a new user-company relationship", () => __awaiter(void 0, void 0, void 0, function* () {
            const [insertedUserId, insertedCompanyId] = yield userCompanyRepo.insert(validUserId, validCompanyId, model_1.CompanyUserRole.ADMIN);
            expect(insertedUserId).toEqual(validUserId);
            expect(insertedCompanyId).toEqual(validCompanyId);
        }));
    });
    describe("delete", () => {
        it("should delete an existing user-company relationship", () => __awaiter(void 0, void 0, void 0, function* () {
            // First, insert the user-company relationship
            yield userCompanyRepo.insert(validUserId, validCompanyId, model_1.CompanyUserRole.ADMIN);
            // Now, delete the relationship
            yield userCompanyRepo.delete(validUserId, validCompanyId);
            // Attempt to find the relationship
            const userCompanyExists = yield userCompanyRepo.getByUserId(validUserId);
            expect(userCompanyExists).not.toContain(validCompanyId); // Expect it to be absent
        }));
    });
    describe("getByUserId", () => {
        it("should return an array of company IDs associated with the user", () => __awaiter(void 0, void 0, void 0, function* () {
            // Insert the user-company relationship
            yield userCompanyRepo.insert(validUserId, validCompanyId, model_1.CompanyUserRole.ADMIN);
            const companies = yield userCompanyRepo.getByUserId(validUserId);
            expect(companies).toContainEqual([validCompanyId, model_1.CompanyUserRole.ADMIN]);
        }));
        it("should return an empty array if the user has no associated companies", () => __awaiter(void 0, void 0, void 0, function* () {
            const companies = yield userCompanyRepo.getByUserId(validUserId);
            expect(companies).toEqual([]); // Expect an empty array
        }));
    });
    describe("getByCompanyId", () => {
        it("should return an array of user IDs associated with the company", () => __awaiter(void 0, void 0, void 0, function* () {
            // Insert the user-company relationship
            yield userCompanyRepo.insert(validUserId, validCompanyId, model_1.CompanyUserRole.ADMIN);
            const users = yield userCompanyRepo.getByCompanyId(validCompanyId);
            expect(users).toContainEqual([validUserId, model_1.CompanyUserRole.ADMIN]);
        }));
        it("should return an empty array if the company has no associated users", () => __awaiter(void 0, void 0, void 0, function* () {
            const newCompany = yield companyRepo.create({
                taxId: "987654321",
                name: "Another Company",
                addressId: null, // Add addressId if needed
            });
            const users = yield userCompanyRepo.getByCompanyId(newCompany.id);
            expect(users).toEqual([]); // Expect an empty array
        }));
    });
});
