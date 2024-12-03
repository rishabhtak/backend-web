"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubController = void 0;
const model_1 = require("../model");
const FinancialIssue_repository_1 = require("../db/FinancialIssue.repository");
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const ApiError_1 = require("../model/error/ApiError");
const decimal_js_1 = __importDefault(require("decimal.js"));
const issueRepository = (0, db_1.getIssueRepository)();
const financialIssueRepository = (0, FinancialIssue_repository_1.getFinancialIssueRepository)();
const dowNumberRepository = (0, db_1.getDowNumberRepository)();
const managedIssueRepository = (0, db_1.getManagedIssueRepository)();
const issueFundingRepo = (0, db_1.getIssueFundingRepository)();
class GithubController {
    static issues(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const issues = yield financialIssueRepository.getAll();
            const response = {
                issues: issues,
            };
            res.status(http_status_codes_1.StatusCodes.OK).send({ success: response });
        });
    }
    static issue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ownerId = new model_1.OwnerId(req.params.owner);
            const repositoryId = new model_1.RepositoryId(ownerId, req.params.repo);
            const issueId = new model_1.IssueId(repositoryId, req.params.number);
            const issue = yield financialIssueRepository.get(issueId);
            if (issue === null) {
                res.sendStatus(http_status_codes_1.StatusCodes.NOT_FOUND);
            }
            else {
                const response = {
                    issue: issue,
                };
                res.status(http_status_codes_1.StatusCodes.OK).send({ success: response });
            }
        });
    }
    // TODO: security issue - this operation does not have an atomic check for the user's DoWs, user can spend DoWs that they don't have
    static fundIssue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Unauthorized");
            }
            // TODO: fix this mess with optional githubId
            const ownerId = new model_1.OwnerId(req.params.owner);
            const repositoryId = new model_1.RepositoryId(ownerId, req.params.repo);
            const issue = yield issueRepository.getById(new model_1.IssueId(repositoryId, req.params.number));
            if (issue === null) {
                res.sendStatus(http_status_codes_1.StatusCodes.NOT_FOUND);
                return;
            }
            const companyId = req.body.companyId
                ? new model_1.CompanyId(req.body.companyId)
                : undefined;
            const dowAmount = new decimal_js_1.default(req.body.dowAmount);
            const managedIssue = yield managedIssueRepository.getByIssueId(issue.id);
            if (managedIssue !== null &&
                managedIssue.state === model_1.ManagedIssueState.REJECTED) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, "Cannot fund an issue where funding was rejected before.");
            }
            const availableDoWs = yield dowNumberRepository.getAvailableDoWs(req.user.id, companyId);
            if (dowAmount.greaterThan(availableDoWs)) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.PAYMENT_REQUIRED, "Not enough DoWs");
            }
            if (availableDoWs.isNeg()) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "The amount of available DoWs is negative");
            }
            const issueFunding = {
                githubIssueId: issue.id,
                userId: req.user.id,
                downAmount: dowAmount,
            };
            yield issueFundingRepo.create(issueFunding);
            return res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
        });
    }
    static requestIssueFunding(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Unauthorized");
            }
            const ownerId = new model_1.OwnerId(req.params.owner);
            const repositoryId = new model_1.RepositoryId(ownerId, req.params.repo);
            const issue = yield issueRepository.getById(new model_1.IssueId(repositoryId, req.params.number));
            if (issue === null)
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, "Issue not found in the DB");
            else if (issue.closedAt !== null)
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, "Cannot request funding for a closed issue");
            const managedIssue = yield managedIssueRepository.getByIssueId(issue.id);
            if (managedIssue === null) {
                const createManagedIssueBody = {
                    githubIssueId: issue.id,
                    requestedDowAmount: new decimal_js_1.default(req.body.dowAmount),
                    managerId: req.user.id,
                    contributorVisibility: model_1.ContributorVisibility.PRIVATE,
                    state: model_1.ManagedIssueState.OPEN,
                };
                yield managedIssueRepository.create(createManagedIssueBody);
                res.status(http_status_codes_1.StatusCodes.CREATED).send({ success: {} });
            }
            else if (managedIssue.managerId !== req.user.id) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, "Someone else is already managing this issue");
            }
            else if (managedIssue.state !== model_1.ManagedIssueState.OPEN) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, "This issue funding is already being REJECTED or SOLVED");
            }
            else {
                managedIssue.requestedDowAmount = new decimal_js_1.default(req.body.dowAmount);
                yield managedIssueRepository.update(managedIssue);
                res.status(http_status_codes_1.StatusCodes.OK).send({ success: {} });
            }
        });
    }
}
exports.GithubController = GithubController;
