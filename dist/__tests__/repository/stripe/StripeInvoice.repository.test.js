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
const jest_setup_1 = require("../../__helpers__/jest.setup");
const model_1 = require("../../../model");
const Fixture_1 = require("../../__helpers__/Fixture");
const db_1 = require("../../../db");
const StripePrice_1 = require("../../../model/stripe/StripePrice");
describe("StripeInvoiceRepository", () => {
    (0, jest_setup_1.setupTestDB)();
    let validUserId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        validUserId = validUser.id;
    }));
    const userRepo = (0, db_1.getUserRepository)();
    const companyRepo = (0, db_1.getCompanyRepository)();
    const customerRepo = (0, db_1.getStripeCustomerRepository)();
    const productRepo = (0, db_1.getStripeProductRepository)();
    const stripeInvoiceRepo = (0, db_1.getStripeInvoiceRepository)();
    describe("create", () => {
        it("should insert an invoice with lines", () => __awaiter(void 0, void 0, void 0, function* () {
            const customerId = Fixture_1.Fixture.stripeCustomerId();
            const invoiceId = Fixture_1.Fixture.stripeInvoiceId();
            const productId = Fixture_1.Fixture.stripeProductId();
            const stripeId1 = Fixture_1.Fixture.stripeInvoiceLineId();
            const stripeId2 = Fixture_1.Fixture.stripeInvoiceLineId();
            // Insert user, company and customer before inserting the customer
            yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
            yield companyRepo.create(Fixture_1.Fixture.createCompanyBody());
            const customer = new model_1.StripeCustomer(customerId, validUserId);
            yield customerRepo.insert(customer);
            yield productRepo.insert(Fixture_1.Fixture.stripeProduct(productId));
            const lines = [
                Fixture_1.Fixture.stripeInvoiceLine(stripeId1, invoiceId, customerId, productId),
                Fixture_1.Fixture.stripeInvoiceLine(stripeId2, invoiceId, customerId, productId),
            ];
            const invoice = Fixture_1.Fixture.stripeInvoice(invoiceId, customerId, lines);
            const created = yield stripeInvoiceRepo.insert(invoice);
            expect(created).toEqual(invoice);
            const found = yield stripeInvoiceRepo.getById(invoiceId);
            expect(found).toEqual(invoice);
        }));
        it("should rollback transaction if inserting lines fails", () => __awaiter(void 0, void 0, void 0, function* () {
            const customerId = Fixture_1.Fixture.stripeCustomerId();
            const invoiceId = Fixture_1.Fixture.stripeInvoiceId();
            const productId = Fixture_1.Fixture.stripeProductId();
            const stripeId1 = Fixture_1.Fixture.stripeInvoiceLineId();
            const stripeId2 = Fixture_1.Fixture.stripeInvoiceLineId();
            // Insert user, company and customer before inserting the customer
            yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
            yield companyRepo.create(Fixture_1.Fixture.createCompanyBody());
            const customer = new model_1.StripeCustomer(customerId, validUserId);
            yield customerRepo.insert(customer);
            yield productRepo.insert(Fixture_1.Fixture.stripeProduct(productId));
            const lines = [
                Fixture_1.Fixture.stripeInvoiceLine(stripeId1, invoiceId, customerId, productId),
                // @ts-ignore
                new model_1.StripeInvoiceLine(stripeId2, invoiceId, customerId, productId, new StripePrice_1.StripePriceId("priceId"), -1),
            ];
            const invoice = Fixture_1.Fixture.stripeInvoice(invoiceId, customerId, lines);
            yield expect(stripeInvoiceRepo.insert(invoice)).rejects.toThrow(Error);
            const found = yield stripeInvoiceRepo.getById(invoiceId);
            expect(found).toBeNull();
        }));
    });
});
