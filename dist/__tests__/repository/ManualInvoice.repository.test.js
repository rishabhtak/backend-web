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
describe("ManualInvoiceRepository", () => {
    const userRepo = (0, db_1.getUserRepository)();
    const companyRepo = (0, db_1.getCompanyRepository)();
    const manualInvoiceRepo = (0, db_1.getManualInvoiceRepository)();
    (0, jest_setup_1.setupTestDB)();
    let userId;
    let companyId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const companyUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        userId = companyUser.id;
        const company = yield companyRepo.create(Fixture_1.Fixture.createCompanyBody());
        companyId = company.id;
    }));
    describe("create", () => {
        it("should create a new manual invoice record", () => __awaiter(void 0, void 0, void 0, function* () {
            const manualInvoiceBody = Fixture_1.Fixture.createManualInvoiceBody(companyId);
            const created = yield manualInvoiceRepo.create(manualInvoiceBody);
            expect(created).toEqual(Fixture_1.Fixture.manualInvoiceFromBody(created.id, manualInvoiceBody));
            const found = yield manualInvoiceRepo.getById(created.id);
            expect(found).toEqual(created);
        }));
        it("can not have companyId and userId defined", () => __awaiter(void 0, void 0, void 0, function* () {
            // TODO: improve type to not have to make this test
            const manualInvoiceBody = Fixture_1.Fixture.createManualInvoiceBody(companyId, userId);
            try {
                yield manualInvoiceRepo.create(manualInvoiceBody);
                // If the insertion doesn't throw, fail the test
                fail("Expected foreign key constraint violation, but no error was thrown.");
            }
            catch (error) {
                expect(error.message).toMatch(/new row for relation \"manual_invoice\" violates check constraint \"chk_company_nor_user/);
            }
        }));
        // Add more test cases for `create`:
        // - Test with invalid data (e.g., missing companyId and userId)
        // - Verify error handling and database constraints
    });
    describe("update", () => {
        it("should update an existing manual invoice record", () => __awaiter(void 0, void 0, void 0, function* () {
            const manualInvoiceBody = Fixture_1.Fixture.createManualInvoiceBody(companyId);
            const created = yield manualInvoiceRepo.create(manualInvoiceBody);
            expect(created).toEqual(Fixture_1.Fixture.manualInvoiceFromBody(created.id, manualInvoiceBody));
            const updatedManualInvoiceBody = Object.assign(Object.assign({}, manualInvoiceBody), { paid: false });
            const updated = yield manualInvoiceRepo.update(Fixture_1.Fixture.manualInvoiceFromBody(created.id, updatedManualInvoiceBody));
            expect(created.id).toEqual(updated.id);
            expect(updated).toEqual(Fixture_1.Fixture.manualInvoiceFromBody(created.id, updatedManualInvoiceBody));
            const found = yield manualInvoiceRepo.getById(updated.id);
            expect(found).toEqual(updated);
        }));
        // Add more test cases for `update`:
        // - Test updating different fields
        // - Test updating a non-existent record
        // - Verify error handling and database constraints
    });
    describe("getById", () => {
        it("should return null if manual invoice not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentManualInvoiceId = new model_1.ManualInvoiceId((0, uuid_1.v4)());
            const found = yield manualInvoiceRepo.getById(nonExistentManualInvoiceId);
            expect(found).toBeNull();
        }));
        // Add more test cases for `getById`:
        // - Test retrieving an existing record
    });
    describe("getAll", () => {
        it("should return all manual invoices", () => __awaiter(void 0, void 0, void 0, function* () {
            const manualInvoiceBody1 = Fixture_1.Fixture.createManualInvoiceBody(companyId);
            const manualInvoiceBody2 = Fixture_1.Fixture.createManualInvoiceBody(undefined, userId);
            yield manualInvoiceRepo.create(manualInvoiceBody1);
            yield manualInvoiceRepo.create(manualInvoiceBody2);
            const allInvoices = yield manualInvoiceRepo.getAll();
            expect(allInvoices.length).toBeGreaterThanOrEqual(2);
        }));
        // Add more test cases for `getAll`:
        // - Test empty database returns an empty array
    });
    describe("getAllInvoicePaidBy", () => {
        it("should return all paid invoices for a given company", () => __awaiter(void 0, void 0, void 0, function* () {
            const paidInvoiceBody = Object.assign(Object.assign({}, Fixture_1.Fixture.createManualInvoiceBody(companyId)), { paid: true });
            const unpaidInvoiceBody = Object.assign(Object.assign({}, Fixture_1.Fixture.createManualInvoiceBody(companyId)), { paid: false });
            yield manualInvoiceRepo.create(paidInvoiceBody);
            yield manualInvoiceRepo.create(unpaidInvoiceBody);
            const paidInvoices = yield manualInvoiceRepo.getAllInvoicePaidBy(companyId);
            expect(paidInvoices.length).toBe(1);
            expect(paidInvoices[0].paid).toBe(true);
            expect(paidInvoices[0].companyId).toEqual(companyId);
        }));
        it("should return all paid invoices for a given user", () => __awaiter(void 0, void 0, void 0, function* () {
            const paidInvoiceBody = Object.assign(Object.assign({}, Fixture_1.Fixture.createManualInvoiceBody(undefined, userId)), { paid: true });
            const unpaidInvoiceBody = Object.assign(Object.assign({}, Fixture_1.Fixture.createManualInvoiceBody(undefined, userId)), { paid: false });
            yield manualInvoiceRepo.create(paidInvoiceBody);
            yield manualInvoiceRepo.create(unpaidInvoiceBody);
            const paidInvoices = yield manualInvoiceRepo.getAllInvoicePaidBy(userId);
            expect(paidInvoices.length).toBe(1);
            expect(paidInvoices[0].paid).toBe(true);
            expect(paidInvoices[0].userId).toEqual(userId);
        }));
        // Add more test cases for `getAllInvoicePaidBy`:
        // - Test with no paid invoices
        // - Test with multiple paid invoices
    });
});
