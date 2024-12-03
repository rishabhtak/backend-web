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
const supertest_1 = __importDefault(require("supertest"));
const createApp_1 = require("../../createApp");
const jest_setup_1 = require("../__helpers__/jest.setup");
describe("/api/v1/auth", () => {
    let app = (0, createApp_1.createApp)();
    (0, jest_setup_1.setupTestDB)();
    it("Register", () => __awaiter(void 0, void 0, void 0, function* () {
        const email = "lauriane@gmail.com";
        const password = "password";
        const registerResponse = yield (0, supertest_1.default)(app)
            .post("/api/v1/auth/register")
            .send({
            name: "Lauriane",
            email: email,
            password: password,
        });
        expect(registerResponse.status).toBe(201);
        // should be logged in
        const response = yield (0, supertest_1.default)(app)
            .get("/api/v1/auth/status")
            .set("Cookie", registerResponse.headers["set-cookie"]);
        // console.log("Response Body:", response.body);
        // console.log("Response Status:", response.status);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("success");
        expect(response.body).toHaveProperty("success.user");
        expect(response.body).toHaveProperty("success.user.id");
        expect(response.body).toHaveProperty("success.user.name", "Lauriane");
        expect(response.body).toHaveProperty("success.user.data.email", email);
        expect(response.body).toHaveProperty("success.user.role", "user");
    }));
    it("Login", () => __awaiter(void 0, void 0, void 0, function* () {
        const email = "lauriane@gmail.com";
        const password = "password";
        // create user
        yield (0, supertest_1.default)(app).post("/api/v1/auth/register").send({
            email: email,
            password: password,
        });
        // login
        const loginResponse = yield (0, supertest_1.default)(app).post("/api/v1/auth/login").send({
            email: email,
            password: password,
        });
        console.log("Response Body:", loginResponse.body);
        console.log("Response Status:", loginResponse.status);
        expect(loginResponse.status).toBe(200);
        // should be logged in
        const response = yield (0, supertest_1.default)(app)
            .get("/api/v1/auth/status")
            .set("Cookie", loginResponse.headers["set-cookie"]);
        // console.log("Response Body:", response.body);
        // console.log("Response Status:", response.status);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("success");
        expect(response.body).toHaveProperty("success.user");
        expect(response.body).toHaveProperty("success.user.id");
        expect(response.body).toHaveProperty("success.user.name", null);
        expect(response.body).toHaveProperty("success.user.data.email", email);
        expect(response.body).toHaveProperty("success.user.role", "user");
    }));
    describe("Logout", () => {
        it("can logout when logged-in", () => __awaiter(void 0, void 0, void 0, function* () {
            const email = "lauriane@gmail.com";
            const password = "password";
            // create user
            yield (0, supertest_1.default)(app).post("/api/v1/auth/register").send({
                email: email,
                password: password,
            });
            // login
            const loginResponse = yield (0, supertest_1.default)(app).post("/api/v1/auth/login").send({
                email: email,
                password: password,
            });
            expect(loginResponse.status).toBe(200);
            // logout
            const logoutResponse = yield (0, supertest_1.default)(app)
                .post("/api/v1/auth/logout")
                .set("Cookie", loginResponse.headers["set-cookie"]);
            expect(logoutResponse.status).toBe(200);
            // should NOT be logged in
            const response = yield (0, supertest_1.default)(app)
                .get("/api/v1/auth/status")
                .set("Cookie", loginResponse.headers["set-cookie"]);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success.user", null);
        }));
        it("can logout when not logged-in", () => __awaiter(void 0, void 0, void 0, function* () {
            const logoutResponse = yield (0, supertest_1.default)(app).post("/api/v1/auth/logout");
            expect(logoutResponse.status).toBe(200);
        }));
    });
});
