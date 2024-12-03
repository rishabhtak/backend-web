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
const Fixture_1 = require("../../__helpers__/Fixture");
const db_1 = require("../../../db");
const model_1 = require("../../../model");
describe("StripeProductRepository", () => {
    (0, jest_setup_1.setupTestDB)();
    const productRepo = (0, db_1.getStripeProductRepository)();
    describe("create", () => {
        it("should insert a product", () => __awaiter(void 0, void 0, void 0, function* () {
            const productId = new model_1.StripeProductId("1");
            const product = Fixture_1.Fixture.stripeProduct(productId);
            const created = yield productRepo.insert(product);
            expect(created).toEqual(product);
            const found = yield productRepo.getById(productId);
            expect(found).toEqual(product);
        }));
        it("should fail with constraint violation if duplicate stripe_id is inserted", () => __awaiter(void 0, void 0, void 0, function* () {
            const productId = new model_1.StripeProductId("1");
            const product = Fixture_1.Fixture.stripeProduct(productId);
            yield productRepo.insert(product);
            try {
                yield productRepo.insert(product);
                fail("Expected a constraint violation error, but none was thrown.");
            }
            catch (error) {
                // Check that the error is related to a constraint violation
                expect(error.message).toMatch(/duplicate key value violates unique constraint/);
            }
        }));
    });
    describe("getById", () => {
        it("should return null if product not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentStripeProductId = new model_1.StripeProductId("non-existent-id");
            const found = yield productRepo.getById(nonExistentStripeProductId);
            expect(found).toBeNull();
        }));
        it("should return a product by ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const productId = new model_1.StripeProductId("1");
            const product = Fixture_1.Fixture.stripeProduct(productId);
            yield productRepo.insert(product);
            const found = yield productRepo.getById(productId);
            expect(found).toEqual(product);
        }));
    });
    describe("getAll", () => {
        it("should return all products", () => __awaiter(void 0, void 0, void 0, function* () {
            const productId1 = new model_1.StripeProductId("1");
            const productId2 = new model_1.StripeProductId("2");
            const product1 = Fixture_1.Fixture.stripeProduct(productId1);
            const product2 = Fixture_1.Fixture.stripeProduct(productId2);
            yield productRepo.insert(product1);
            yield productRepo.insert(product2);
            const allProducts = yield productRepo.getAll();
            expect(allProducts).toHaveLength(2);
            expect(allProducts).toContainEqual(product1);
            expect(allProducts).toContainEqual(product2);
        }));
        it("should return an empty array if no products exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const allProducts = yield productRepo.getAll();
            expect(allProducts).toEqual([]);
        }));
    });
});
