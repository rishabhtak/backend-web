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
describe("CompanyRepository", () => {
    const addressRepo = (0, db_1.getAddressRepository)();
    const userRepo = (0, db_1.getUserRepository)();
    const userCompanyRepo = (0, db_1.getUserCompanyRepository)();
    const companyRepo = (0, db_1.getCompanyRepository)();
    (0, jest_setup_1.setupTestDB)();
    let validAddressId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const address = yield addressRepo.create(Fixture_1.Fixture.createAddressBody());
        validAddressId = address.id;
    }));
    describe("insert", () => {
        it("when addressId is null", () => __awaiter(void 0, void 0, void 0, function* () {
            const company = Fixture_1.Fixture.createCompanyBody();
            const created = yield companyRepo.create(company);
            expect(created).toEqual(Fixture_1.Fixture.companyFromBody(created.id, company));
            const found = yield companyRepo.getById(created.id);
            expect(found).toEqual(created);
        }));
        it("when addressId is NOT null", () => __awaiter(void 0, void 0, void 0, function* () {
            const company = Fixture_1.Fixture.createCompanyBody(validAddressId);
            const created = yield companyRepo.create(company);
            expect(created).toEqual(Fixture_1.Fixture.companyFromBody(created.id, company));
            const found = yield companyRepo.getById(created.id);
            expect(found).toEqual(created);
        }));
    });
    describe("update", () => {
        it("should handle updating with no data changes", () => __awaiter(void 0, void 0, void 0, function* () {
            const initialCompany = Fixture_1.Fixture.createCompanyBody(validAddressId);
            const created = yield companyRepo.create(initialCompany);
            const updated = yield companyRepo.update(created);
            const found = yield companyRepo.getById(created.id);
            expect(found).toEqual(updated);
        }));
        it("should handle updating and address_id to NULL", () => __awaiter(void 0, void 0, void 0, function* () {
            // Insert a company with a non-null contact person ID
            const initialCompany = Fixture_1.Fixture.createCompanyBody(validAddressId);
            const created = yield companyRepo.create(initialCompany);
            const updatedCompany = new model_1.Company(created.id, created.taxId, created.name, null);
            const updated = yield companyRepo.update(updatedCompany);
            expect(updated.addressId).toBeNull();
            const found = yield companyRepo.getById(created.id);
            expect(found).toEqual(updated);
        }));
        it("should update an existing company", () => __awaiter(void 0, void 0, void 0, function* () {
            // Insert a company first
            const created = yield companyRepo.create({
                taxId: "123456",
                name: "Company A",
                addressId: validAddressId,
            });
            const updatedCompany = new model_1.Company(created.id, "00000", "Company B", validAddressId);
            const updated = yield companyRepo.update(updatedCompany);
            expect(updated).toEqual(updatedCompany);
            const found = yield companyRepo.getById(created.id);
            expect(found).toEqual(updated);
        }));
    });
    describe("getById", () => {
        it("should return null if company not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentCompanyId = Fixture_1.Fixture.companyId();
            const found = yield companyRepo.getById(nonExistentCompanyId);
            expect(found).toBeNull();
        }));
    });
    describe("getAll", () => {
        it("should return all companies", () => __awaiter(void 0, void 0, void 0, function* () {
            const company1 = yield companyRepo.create(Fixture_1.Fixture.createCompanyBody());
            const company2 = yield companyRepo.create(Fixture_1.Fixture.createCompanyBody());
            const allCompanies = yield companyRepo.getAll();
            expect(allCompanies).toHaveLength(2);
            expect(allCompanies).toContainEqual(company1);
            expect(allCompanies).toContainEqual(company2);
        }));
        it("should return an empty array if no companies exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const allCompanies = yield companyRepo.getAll();
            expect(allCompanies).toEqual([]);
        }));
    });
});
