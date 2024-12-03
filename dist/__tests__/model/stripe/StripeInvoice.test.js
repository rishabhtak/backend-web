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
const model_1 = require("../../../model");
const fs = __importStar(require("fs"));
const config_1 = require("../../../config");
describe("StripeInvoice", () => {
    it("fromStripeApi does not throw an error", () => {
        const data = fs.readFileSync(`src/__tests__/model/stripe/invoice.paid.json`, "utf8");
        const json = JSON.parse(data);
        const invoice = model_1.StripeInvoice.fromStripeApi(json);
        if (invoice instanceof Error) {
            config_1.logger.error(invoice);
        }
        expect(invoice).toBeInstanceOf(model_1.StripeInvoice);
    });
});
