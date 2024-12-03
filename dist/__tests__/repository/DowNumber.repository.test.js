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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_setup_1 = require("../__helpers__/jest.setup");
const model_1 = require("../../model");
const db_1 = require("../../db/");
const Fixture_1 = require("../__helpers__/Fixture");
const decimal_js_1 = __importDefault(require("decimal.js"));
describe("DowNumberRepository", () => {
    const userRepo = (0, db_1.getUserRepository)();
    const companyRepo = (0, db_1.getCompanyRepository)();
    const userCompanyRepo = (0, db_1.getUserCompanyRepository)();
    const dowNumberRepo = (0, db_1.getDowNumberRepository)();
    const ownerRepo = (0, db_1.getOwnerRepository)();
    const repoRepo = (0, db_1.getRepositoryRepository)();
    const issueRepo = (0, db_1.getIssueRepository)();
    const issueFundingRepo = (0, db_1.getIssueFundingRepository)();
    const manualInvoiceRepo = (0, db_1.getManualInvoiceRepository)();
    (0, jest_setup_1.setupTestDB)();
    let lonelyUserId;
    let companyUserId1;
    let companyUserId2;
    let validCompanyId;
    let validIssueId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const lonelyUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        lonelyUserId = lonelyUser.id;
        const validCompany = yield companyRepo.create(Fixture_1.Fixture.createCompanyBody());
        validCompanyId = validCompany.id;
        const companyUser1 = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        companyUserId1 = companyUser1.id;
        yield userCompanyRepo.insert(companyUserId1, validCompanyId, model_1.CompanyUserRole.ADMIN);
        const companyUser2 = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        companyUserId2 = companyUser2.id;
        yield userCompanyRepo.insert(companyUserId2, validCompanyId, model_1.CompanyUserRole.ADMIN);
        const ownerId = Fixture_1.Fixture.ownerId();
        yield ownerRepo.insertOrUpdate(Fixture_1.Fixture.owner(ownerId));
        const repositoryId = Fixture_1.Fixture.repositoryId(ownerId);
        yield repoRepo.insertOrUpdate(Fixture_1.Fixture.repository(repositoryId));
        validIssueId = Fixture_1.Fixture.issueId(repositoryId);
        yield issueRepo.createOrUpdate(Fixture_1.Fixture.issue(validIssueId, ownerId));
    }));
    describe("getAvailableDoWs", () => {
        describe("should return 0", () => {
            it("for a user with no invoices nor issue funding", () => __awaiter(void 0, void 0, void 0, function* () {
                const totalDoWs = yield dowNumberRepo.getAvailableDoWs(lonelyUserId);
                expect(totalDoWs).toEqual(new decimal_js_1.default(0));
            }));
            it("for a company with no invoices nor issue funding", () => __awaiter(void 0, void 0, void 0, function* () {
                const totalDoWs = yield dowNumberRepo.getAvailableDoWs(companyUserId1, validCompanyId);
                expect(totalDoWs).toEqual(new decimal_js_1.default(0));
            }));
        });
        describe("should return the amount manually added", () => {
            it("for a user", () => __awaiter(void 0, void 0, void 0, function* () {
                const manualInvoiceBody = Object.assign(Object.assign({}, Fixture_1.Fixture.createManualInvoiceBody(undefined, lonelyUserId)), { dowAmount: new decimal_js_1.default(200) });
                yield manualInvoiceRepo.create(manualInvoiceBody);
                const totalDoWs = yield dowNumberRepo.getAvailableDoWs(lonelyUserId);
                expect(totalDoWs).toEqual(new decimal_js_1.default(200));
            }));
            it("for a company", () => __awaiter(void 0, void 0, void 0, function* () {
                const manualInvoiceBody = Object.assign(Object.assign({}, Fixture_1.Fixture.createManualInvoiceBody(validCompanyId)), { dowAmount: new decimal_js_1.default(200) });
                yield manualInvoiceRepo.create(manualInvoiceBody);
                const totalDoWs = yield dowNumberRepo.getAvailableDoWs(companyUserId1, validCompanyId);
                expect(totalDoWs).toEqual(new decimal_js_1.default(200));
            }));
        });
        describe("should return the amount added with stripe", () => {
            it("for a user", () => __awaiter(void 0, void 0, void 0, function* () {
                // TODO
            }));
            it("for a company", () => __awaiter(void 0, void 0, void 0, function* () {
                // TODO
            }));
        });
        describe("should return the sum added with stripe and manually added", () => {
            it("for a user", () => __awaiter(void 0, void 0, void 0, function* () {
                // TODO
            }));
            it("for a company", () => __awaiter(void 0, void 0, void 0, function* () {
                // TODO
            }));
        });
        describe("should deduct a funding issue", () => {
            it("for a user", () => __awaiter(void 0, void 0, void 0, function* () {
                const manualInvoiceBody = Object.assign(Object.assign({}, Fixture_1.Fixture.createManualInvoiceBody(undefined, lonelyUserId)), { dowAmount: new decimal_js_1.default(200) });
                yield manualInvoiceRepo.create(manualInvoiceBody);
                const issueFundingBody1 = {
                    githubIssueId: validIssueId,
                    userId: lonelyUserId,
                    downAmount: new decimal_js_1.default(50),
                };
                const issueFundingBody2 = Object.assign(Object.assign({}, issueFundingBody1), { downAmount: new decimal_js_1.default(20) });
                yield issueFundingRepo.create(issueFundingBody1);
                yield issueFundingRepo.create(issueFundingBody2);
                const totalDoWs = yield dowNumberRepo.getAvailableDoWs(lonelyUserId);
                expect(totalDoWs).toEqual(new decimal_js_1.default(200 - 50 - 20));
            }));
            it("for a company", () => __awaiter(void 0, void 0, void 0, function* () {
                const manualInvoiceBody = Object.assign(Object.assign({}, Fixture_1.Fixture.createManualInvoiceBody(validCompanyId)), { dowAmount: new decimal_js_1.default(200) });
                yield manualInvoiceRepo.create(manualInvoiceBody);
                const issueFundingBody1 = {
                    githubIssueId: validIssueId,
                    userId: companyUserId2,
                    downAmount: new decimal_js_1.default(50),
                };
                const issueFundingBody2 = Object.assign(Object.assign({}, issueFundingBody1), { downAmount: new decimal_js_1.default(20) });
                yield issueFundingRepo.create(issueFundingBody1);
                yield issueFundingRepo.create(issueFundingBody2);
                const expected = new decimal_js_1.default(200 - 50 - 20);
                const totalDoWs1 = yield dowNumberRepo.getAvailableDoWs(companyUserId1, validCompanyId);
                expect(totalDoWs1).toEqual(expected);
                const totalDoWs2 = yield dowNumberRepo.getAvailableDoWs(companyUserId2, validCompanyId);
                expect(totalDoWs2).toEqual(expected);
            }));
        });
        // TODO: Add all the possible test cases for `getAvailableDoWs`:
    });
});
