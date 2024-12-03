"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../../controllers/user.controllers");
const isAuth_1 = require("../../middlewares/isAuth");
const router = (0, express_1.Router)();
// TODO: security: make sure the user belongs to the company that is funding the issue
router.get("/available-dow", isAuth_1.isAuth, user_controllers_1.UserController.getAvailableDow);
exports.default = router;
