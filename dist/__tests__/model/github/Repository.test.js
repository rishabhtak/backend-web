"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const model_1 = require("../../../model");
const config_1 = require("../../../config");
describe("Repository", () => {
    it("fromGithubApi does not throw an error", () => {
        const data = fs_1.default.readFileSync(`src/__tests__/__data__/github/repository.json`, "utf8");
        const json = JSON.parse(data);
        const object = model_1.Repository.fromGithubApi(json);
        if (object instanceof Error) {
            config_1.logger.error(object);
        }
        const ownerId = new model_1.OwnerId("Open-Source-Economy", 141809657);
        const repositoryId = new model_1.RepositoryId(ownerId, "frontend", 701996033);
        const expected = new model_1.Repository(repositoryId, "https://github.com/Open-Source-Economy/frontend", undefined);
        expect(object).toBeInstanceOf(model_1.Repository);
        expect(object).toEqual(expected);
    });
});
