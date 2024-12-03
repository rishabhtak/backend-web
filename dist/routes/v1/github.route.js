"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const github_controllers_1 = require("../../controllers/github.controllers");
const isAuth_1 = require("../../middlewares/isAuth");
const router = (0, express_1.Router)();
router.get("/issues", github_controllers_1.GithubController.issues);
router.get("/:owner/:repo/issues/:number", 
// checkSchema(createUserValidationSchema),
github_controllers_1.GithubController.issue);
// TODO: add validation schema
router.post("/:owner/:repo/issues/:number/fund", isAuth_1.isAuth, // TODO: security: make sure the user belongs to the company that is funding the issue
github_controllers_1.GithubController.fundIssue);
// TODO: add validation schema
router.post("/:owner/:repo/issues/:number/request-funding", isAuth_1.isAuth, // TODO: security: make sure the user belongs to the company that is funding the issue
github_controllers_1.GithubController.requestIssueFunding);
exports.default = router;
