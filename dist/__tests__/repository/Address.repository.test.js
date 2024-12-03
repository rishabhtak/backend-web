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
describe("AddressRepository", () => {
    const userRepo = (0, db_1.getUserRepository)();
    const companyRepo = (0, db_1.getCompanyRepository)();
    const userCompanyRepo = (0, db_1.getUserCompanyRepository)();
    const addressRepo = (0, db_1.getAddressRepository)();
    (0, jest_setup_1.setupTestDB)();
    let validUserId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        validUserId = validUser.id;
    }));
    describe("create", () => {
        it("should create a new company address", () => __awaiter(void 0, void 0, void 0, function* () {
            const addressBody = {
                name: "Company Name",
            };
            const created = yield addressRepo.create(addressBody);
            expect(created).toEqual(Fixture_1.Fixture.addressFromBody(created.id, addressBody));
            const found = yield addressRepo.getById(created.id);
            expect(found).toEqual(created);
        }));
    });
    describe("update", () => {
        it("should update an existing company address", () => __awaiter(void 0, void 0, void 0, function* () {
            const addressBody = {
                name: "Company Name",
            };
            // First create the address
            const created = yield addressRepo.create(addressBody);
            // Update the address
            const updatedAddressBody = {
                name: "Updated Company Name",
            };
            const updated = yield addressRepo.update(Fixture_1.Fixture.addressFromBody(created.id, updatedAddressBody));
            expect(created.id).toEqual(updated.id);
            expect(updated).toEqual(Fixture_1.Fixture.addressFromBody(created.id, updatedAddressBody));
            const found = yield addressRepo.getById(updated.id);
            expect(found).toEqual(updated);
        }));
    });
    describe("getById", () => {
        it("should return null if address not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentAddressId = Fixture_1.Fixture.addressId();
            const found = yield addressRepo.getById(nonExistentAddressId);
            expect(found).toBeNull();
        }));
    });
    describe("getByCompanyId", () => {
        it("should return the address for a given company ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const addressBody = {
                name: "Company Name",
            };
            // First create the address
            const created = yield addressRepo.create(addressBody);
            // Create a company with an associated address
            const companyBody = {
                name: "Test Company",
                taxId: "1234",
                addressId: created.id,
            };
            const company = yield companyRepo.create(companyBody);
            // Fetch the address using getByCompanyId
            const address = yield addressRepo.getByCompanyId(company.id);
            expect(address).toEqual(created);
        }));
        it("should return null if the company has no associated address", () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a company without an associated address
            const companyBody = Fixture_1.Fixture.createCompanyBody();
            const company = yield companyRepo.create(companyBody);
            // Fetch the address
            const address = yield addressRepo.getByCompanyId(company.id);
            expect(address).toBeNull();
        }));
    });
    describe("getCompanyUserAddress", () => {
        it("should return the address associated with the user's company", () => __awaiter(void 0, void 0, void 0, function* () {
            const addressBody = {
                name: "Company Name",
            };
            // First create the address
            const created = yield addressRepo.create(addressBody);
            const companyBody = {
                name: "Test Company",
                taxId: "12345",
                contactPersonId: validUserId,
                addressId: created.id,
            };
            const company = yield companyRepo.create(companyBody);
            yield userCompanyRepo.insert(validUserId, company.id, model_1.CompanyUserRole.ADMIN);
            // Fetch the address using the user ID
            const address = yield addressRepo.getCompanyUserAddress(validUserId);
            expect(address).toEqual(created);
        }));
        it("should return null if the user is not linked to any company", () => __awaiter(void 0, void 0, void 0, function* () {
            // Fetch the address
            const address = yield addressRepo.getCompanyUserAddress(validUserId);
            expect(address).toBeNull();
        }));
    });
    describe("getAll", () => {
        it("should return an empty array if no address exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const alladdress = yield addressRepo.getAll();
            expect(alladdress).toEqual([]);
        }));
        it("should return all company address", () => __awaiter(void 0, void 0, void 0, function* () {
            const addressId1 = Fixture_1.Fixture.uuid();
            const addressId2 = Fixture_1.Fixture.uuid();
            const address = {
                name: "Company Name",
            };
            const address1 = yield addressRepo.create(address);
            const address2 = yield addressRepo.create(address);
            const alladdress = yield addressRepo.getAll();
            expect(alladdress).toHaveLength(2);
            expect(alladdress).toContainEqual(Fixture_1.Fixture.addressFromBody(address1.id, address));
            expect(alladdress).toContainEqual(Fixture_1.Fixture.addressFromBody(address2.id, address));
        }));
    });
});
