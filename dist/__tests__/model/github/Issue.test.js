"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const model_1 = require("../../../model");
const config_1 = require("../../../config");
describe("Issue", () => {
    it("fromGithubApi does not throw an error", () => {
        const data = fs_1.default.readFileSync(`src/__tests__/__data__/github/issue.json`, "utf8");
        const ownerId = new model_1.OwnerId("Open-Source-Economy", 141809657);
        const repositoryId = new model_1.RepositoryId(ownerId, "frontend", 701996033);
        const json = JSON.parse(data);
        const object = model_1.Issue.fromGithubApi(repositoryId, json);
        if (object instanceof Error) {
            config_1.logger.error(object);
        }
        const issueId = new model_1.IssueId(repositoryId, 3, 2538344642);
        const expected = new model_1.Issue(issueId, "Test issue - to be added in our unit tests", "https://github.com/Open-Source-Economy/frontend/issues/3", new Date("2024-09-20T09:34:07Z"), null, new model_1.OwnerId("LaurianeOSE", 141809342), undefined);
        expect(object).toBeInstanceOf(model_1.Issue);
        expect(object).toEqual(expected);
    });
});
