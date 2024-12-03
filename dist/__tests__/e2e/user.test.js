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
const createApp_1 = require("../../createApp");
const jest_setup_1 = require("../__helpers__/jest.setup");
describe("/api/v1/users", () => {
    let app = (0, createApp_1.createApp)();
    (0, jest_setup_1.setupTestDB)();
    it("should return an empty array when getting /api/v1/users", () => __awaiter(void 0, void 0, void 0, function* () {
        // const response = await request(app).get("/api/v1/users");
        // console.log("Response Body:", response.body); // Log the response body for debugging
        // console.log("Response Status:", response.status); // Log the response status for debugging
        //
        // // Check if the response status is 200 OK
        // expect(response.status).toBe(200);
        //
        // // Check if the response body is an empty array
        // expect(response.body).toStrictEqual([]);
    }));
});
