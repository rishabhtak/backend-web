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
describe("StripeCustomerRepository", () => {
    (0, jest_setup_1.setupTestDB)();
    let validUserId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
        validUserId = validUser.id;
    }));
    const customerRepo = (0, db_1.getStripeCustomerRepository)();
    const userRepo = (0, db_1.getUserRepository)();
    describe("create", () => {
        it("should work", () => __awaiter(void 0, void 0, void 0, function* () {
            const customerId = Fixture_1.Fixture.stripeCustomerId();
            // Insert user before inserting the customer
            yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
            const customer = new model_1.StripeCustomer(customerId, validUserId);
            const created = yield customerRepo.insert(customer);
            expect(created).toEqual(customer);
            const found = yield customerRepo.getById(customerId);
            expect(found).toEqual(customer);
        }));
        it("should fail with foreign key constraint error if user is not inserted", () => __awaiter(void 0, void 0, void 0, function* () {
            const customerId = new model_1.StripeCustomerId("123");
            const customer = new model_1.StripeCustomer(customerId, Fixture_1.Fixture.userId());
            try {
                yield customerRepo.insert(customer);
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
        it("should return null if customer not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentCustomerId = new model_1.StripeCustomerId("non-existent-id");
            const found = yield customerRepo.getById(nonExistentCustomerId);
            expect(found).toBeNull();
        }));
    });
    describe("getAll", () => {
        it("should return all customers", () => __awaiter(void 0, void 0, void 0, function* () {
            // Insert user before inserting the customer
            yield userRepo.insert(Fixture_1.Fixture.createUser(Fixture_1.Fixture.localUser()));
            const customerId1 = new model_1.StripeCustomerId("123");
            const customerId2 = new model_1.StripeCustomerId("abc");
            const customer1 = new model_1.StripeCustomer(customerId1, validUserId);
            const customer2 = new model_1.StripeCustomer(customerId2, validUserId);
            yield customerRepo.insert(customer1);
            yield customerRepo.insert(customer2);
            const allCustomers = yield customerRepo.getAll();
            expect(allCustomers).toHaveLength(2);
            expect(allCustomers).toContainEqual(customer1);
            expect(allCustomers).toContainEqual(customer2);
        }));
        it("should return an empty array if no customers exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const allCustomers = yield customerRepo.getAll();
            expect(allCustomers).toEqual([]);
        }));
    });
});
