"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const stripe_controllers_1 = require("../../controllers/stripe.controllers");
const router = (0, express_1.Router)();
router.get("/get-dow-prices", stripe_controllers_1.StripeController.getDowPrices);
router.get("/create-customer", stripe_controllers_1.StripeController.createCustomer);
router.get("/create-subscription", stripe_controllers_1.StripeController.createSubscription);
router.get("/create-payment-intent", stripe_controllers_1.StripeController.createPaymentIntent);
router.post("/webhook", express_1.default.raw({ type: "application/json" }), stripe_controllers_1.StripeController.webhook);
exports.default = router;
