"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueState = void 0;
var IssueState;
(function (IssueState) {
    IssueState[IssueState["FUND_OFFERED"] = 0] = "FUND_OFFERED";
    IssueState[IssueState["COLLECT_REJECTED"] = 1] = "COLLECT_REJECTED";
    IssueState[IssueState["REFUNDED"] = 2] = "REFUNDED";
    IssueState[IssueState["COLLECT_APPROVED"] = 3] = "COLLECT_APPROVED";
    IssueState[IssueState["FUND_TO_BE_DISTRIBUTED"] = 4] = "FUND_TO_BE_DISTRIBUTED";
    IssueState[IssueState["FUND_DISTRIBUTED"] = 5] = "FUND_DISTRIBUTED";
})(IssueState || (exports.IssueState = IssueState = {}));
