"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const model_1 = require("../../../model");
describe("Owner", () => {
    it("fromGithubApi does not throw an error", () => {
        const data = fs_1.default.readFileSync(`src/__tests__/__data__/github/owner-org.json`, "utf8");
        const json = JSON.parse(data);
        const object = model_1.Owner.fromGithubApi(json);
        const expected = new model_1.Owner(new model_1.OwnerId("Open-Source-Economy", 141809657), model_1.OwnerType.Organization, "https://github.com/Open-Source-Economy", "https://avatars.githubusercontent.com/u/141809657?v=4");
        expect(object).toBeInstanceOf(model_1.Owner);
        expect(object).toEqual(expected);
    });
});
