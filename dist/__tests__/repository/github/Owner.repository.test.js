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
const db_1 = require("../../../db");
const Fixture_1 = require("../../__helpers__/Fixture");
const model_1 = require("../../../model");
describe("OwnerRepository", () => {
    (0, jest_setup_1.setupTestDB)();
    const repo = (0, db_1.getOwnerRepository)();
    describe("create", () => {
        describe("insert", () => {
            it("should work", () => __awaiter(void 0, void 0, void 0, function* () {
                const ownerId = Fixture_1.Fixture.ownerId();
                const owner = Fixture_1.Fixture.owner(ownerId);
                const created = yield repo.insertOrUpdate(owner);
                expect(created).toEqual(owner);
                const found = yield repo.getById(owner.id);
                expect(found).toEqual(owner);
            }));
        });
        describe("update", () => {
            it("should work", () => __awaiter(void 0, void 0, void 0, function* () {
                const ownerId = Fixture_1.Fixture.ownerId();
                const owner = Fixture_1.Fixture.owner(ownerId);
                yield repo.insertOrUpdate(owner);
                const updatedOwner = Fixture_1.Fixture.owner(ownerId, "updated-payload");
                const updated = yield repo.insertOrUpdate(updatedOwner);
                expect(updated).toEqual(updatedOwner);
                const found = yield repo.getById(owner.id);
                expect(found).toEqual(updatedOwner);
            }));
        });
    });
    describe("getById", () => {
        it("should return null if owner not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentOwnerId = Fixture_1.Fixture.ownerId();
            const found = yield repo.getById(nonExistentOwnerId);
            expect(found).toBeNull();
        }));
        it("succeed when github ids are not given", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId = Fixture_1.Fixture.ownerId();
            const owner = Fixture_1.Fixture.owner(ownerId);
            yield repo.insertOrUpdate(owner);
            const undefinedOwnerId = new model_1.OwnerId(ownerId.login, undefined);
            const found = yield repo.getById(undefinedOwnerId);
            expect(found).toEqual(owner);
        }));
    });
    describe("getAll", () => {
        it("should return all owners", () => __awaiter(void 0, void 0, void 0, function* () {
            const ownerId1 = Fixture_1.Fixture.ownerId();
            const ownerId2 = Fixture_1.Fixture.ownerId();
            const owner1 = Fixture_1.Fixture.owner(ownerId1, "payload1");
            const owner2 = Fixture_1.Fixture.owner(ownerId2, "payload2");
            yield repo.insertOrUpdate(owner1);
            yield repo.insertOrUpdate(owner2);
            const allOwners = yield repo.getAll();
            expect(allOwners).toHaveLength(2);
            expect(allOwners).toContainEqual(owner1);
            expect(allOwners).toContainEqual(owner2);
        }));
        it("should return an empty array if no owners exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const allOwners = yield repo.getAll();
            expect(allOwners).toEqual([]);
        }));
    });
});
