"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./auth.route"));
const user_route_1 = __importDefault(require("./user.route"));
const stripe_route_1 = __importDefault(require("./stripe.route"));
const admin_route_1 = __importDefault(require("./admin.route"));
const github_route_1 = __importDefault(require("./github.route"));
const router = express_1.default.Router();
router.use("/auth", auth_route_1.default);
router.use("/user", user_route_1.default);
router.use("/stripe", stripe_route_1.default);
router.use("/admin", admin_route_1.default);
router.use("/github", github_route_1.default);
exports.default = router;
