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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialIssue = void 0;
const model = __importStar(require("./index"));
const decimal_js_1 = __importDefault(require("decimal.js"));
class FinancialIssue {
    constructor(owner, repository, issue, issueManager, managedIssue, issueFundings) {
        this.owner = owner;
        this.repository = repository;
        this.issue = issue;
        this.issueManager = issueManager;
        this.managedIssue = managedIssue;
        this.issueFundings = issueFundings;
    }
    // TODO: Why static? Because in the frontend the parsing of the object does not work.
    //   async getFinancialIssue(query: GetIssueQuery): Promise<FinancialIssue> {
    //     const response = await handleError<GetIssueResponse>(
    //       () => axios.get(`${API_URL}/github/${query.owner}/${query.repo}/issues/${query.number}`, { withCredentials: true }),
    //       "getFinancialIssue",
    //     );
    //     response.issue.isClosed(); // ERROR
    //     return response.issue;
    //   }
    static amountCollected(m) {
        var _a, _b;
        // @ts-ignore
        return ((_b = (_a = m.issueFundings) === null || _a === void 0 ? void 0 : _a.reduce((acc, funding) => acc.plus(funding.dowAmount), new decimal_js_1.default(0))) !== null && _b !== void 0 ? _b : new decimal_js_1.default(0));
    }
    static amountRequested(m) {
        var _a;
        return (_a = m.managedIssue) === null || _a === void 0 ? void 0 : _a.requestedDowAmount;
    }
    static successfullyFunded(m) {
        const amountRequested = FinancialIssue.amountRequested(m);
        if (amountRequested === undefined)
            return false;
        else
            return FinancialIssue.amountCollected(m).greaterThanOrEqualTo(amountRequested);
    }
    static isClosed(m) {
        var _a, _b;
        return (((_a = m.managedIssue) === null || _a === void 0 ? void 0 : _a.state) === model.ManagedIssueState.REJECTED ||
            ((_b = m.managedIssue) === null || _b === void 0 ? void 0 : _b.state) === model.ManagedIssueState.SOLVED);
    }
    static id(m) {
        return `${m.owner.id}/${m.repository.id}/${m.issue.id.number}`;
    }
}
exports.FinancialIssue = FinancialIssue;
