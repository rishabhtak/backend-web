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
exports.setupTestDB = void 0;
const migration_1 = require("../../db/migration");
const globals_1 = require("@jest/globals");
const dbPool_1 = require("../../dbPool");
const config_1 = require("../../config");
const setupTestDB = () => {
    const pool = (0, dbPool_1.getPool)();
    const migration = new migration_1.Migration(pool);
    (0, globals_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield migration.drop();
            yield migration.migrate();
        }
        catch (error) {
            config_1.logger.error("Error during migration in beforeAll: ", error);
            throw error;
        }
    }));
    (0, globals_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield migration.drop();
        }
        catch (error) {
            config_1.logger.error("Error during migration drop in afterAll: ", error);
            throw error;
        }
    }));
    (0, globals_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
    }));
};
exports.setupTestDB = setupTestDB;
