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
const db_1 = require("../../../db");
const jest_setup_1 = require("../../__helpers__/jest.setup");
const Fixture_1 = require("../../__helpers__/Fixture");
const model_1 = require("../../../model");
describe("StripeInvoiceLineRepository", () => {
    (0, jest_setup_1.setupTestDB)();
    const userRepo = (0, db_1.getUserRepository)();
    const productRepo = (0, db_1.getStripeProductRepository)();
    const invoiceLineRepo = (0, db_1.getStripeInvoiceLineRepository)();
    const invoiceRepo = (0, db_1.getStripeInvoiceRepository)();
    const customerRepo = (0, db_1.getStripeCustomerRepository)();
    let validUserId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        validUserId = validUser.id;
    }));
    describe("create", () => {
        it("should work", () => __awaiter(void 0, void 0, void 0, function* () {
            const customerId = Fixture_1.Fixture.stripeCustomerId();
            const invoiceId = Fixture_1.Fixture.stripeInvoiceId();
            const productId = Fixture_1.Fixture.stripeProductId();
            yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
            yield customerRepo.insert(new model_1.StripeCustomer(customerId, validUserId));
            yield productRepo.insert(Fixture_1.Fixture.stripeProduct(productId));
            yield invoiceRepo.insert(Fixture_1.Fixture.stripeInvoice(invoiceId, customerId, []));
            const invoiceLineId = Fixture_1.Fixture.stripeInvoiceLineId();
            const invoiceLine = Fixture_1.Fixture.stripeInvoiceLine(invoiceLineId, invoiceId, customerId, productId);
            const created = yield invoiceLineRepo.insert(invoiceLine);
            expect(created).toEqual(invoiceLine);
            const found = yield invoiceLineRepo.getById(invoiceLine.stripeId);
            expect(found).toEqual(invoiceLine);
            expect(true).toEqual(true);
        }));
        it("should fail with foreign key constraint error if invoice or customer is not inserted", () => __awaiter(void 0, void 0, void 0, function* () {
            const customerId = Fixture_1.Fixture.stripeCustomerId();
            const invoiceId = Fixture_1.Fixture.stripeInvoiceId();
            const productId = Fixture_1.Fixture.stripeProductId();
            yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
            yield customerRepo.insert(new model_1.StripeCustomer(customerId, validUserId));
            yield productRepo.insert(Fixture_1.Fixture.stripeProduct(productId));
            const invoiceLineId = Fixture_1.Fixture.stripeInvoiceLineId();
            const invoiceLine = Fixture_1.Fixture.stripeInvoiceLine(invoiceLineId, invoiceId, customerId, productId);
            try {
                yield invoiceLineRepo.insert(invoiceLine);
                // If the insertion doesn't throw, fail the test
                fail("Expected foreign key constraint violation, but no error was thrown.");
            }
            catch (error) {
                // Check if the error is related to foreign key constraint
                expect(error.message).toMatch(/violates foreign key constraint/);
            }
        }));
    });
    describe("getById", () => {
        it("should return null if invoice line not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentInvoiceLineId = new model_1.StripeInvoiceLineId("non-existent-id");
            const found = yield invoiceLineRepo.getById(nonExistentInvoiceLineId);
            expect(found).toBeNull();
        }));
    });
    describe("getAll", () => {
        it("should return all invoice lines", () => __awaiter(void 0, void 0, void 0, function* () {
            const customerId = Fixture_1.Fixture.stripeCustomerId();
            const invoiceId = Fixture_1.Fixture.stripeInvoiceId();
            const productId = Fixture_1.Fixture.stripeProductId();
            yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
            yield customerRepo.insert(new model_1.StripeCustomer(customerId, validUserId));
            yield productRepo.insert(Fixture_1.Fixture.stripeProduct(productId));
            yield invoiceRepo.insert(Fixture_1.Fixture.stripeInvoice(invoiceId, customerId, []));
            const invoiceLineId1 = Fixture_1.Fixture.stripeInvoiceLineId();
            const invoiceLineId2 = Fixture_1.Fixture.stripeInvoiceLineId();
            const invoiceLine1 = Fixture_1.Fixture.stripeInvoiceLine(invoiceLineId1, invoiceId, customerId, productId);
            const invoiceLine2 = Fixture_1.Fixture.stripeInvoiceLine(invoiceLineId2, invoiceId, customerId, productId);
            yield invoiceLineRepo.insert(invoiceLine1);
            yield invoiceLineRepo.insert(invoiceLine2);
            const allInvoiceLines = yield invoiceLineRepo.getAll();
            expect(allInvoiceLines).toHaveLength(2);
            expect(allInvoiceLines).toContainEqual(invoiceLine1);
            expect(allInvoiceLines).toContainEqual(invoiceLine2);
        }));
        it("should return an empty array if no invoice lines exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const allInvoiceLines = yield invoiceLineRepo.getAll();
            expect(allInvoiceLines).toEqual([]);
        }));
    });
});
