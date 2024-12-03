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
exports.AdminController = void 0;
const http_status_codes_1 = require("http-status-codes");
const db_1 = require("../db");
const utils_1 = require("../utils");
const services_1 = require("../services");
const decimal_js_1 = __importDefault(require("decimal.js"));
const FinancialIssue_repository_1 = require("../db/FinancialIssue.repository");
const addressRepository = (0, db_1.getAddressRepository)();
const companyRepository = (0, db_1.getCompanyRepository)();
const companyUserPermissionTokenRepository = (0, db_1.getCompanyUserPermissionTokenRepository)();
const repositoryUserPermissionTokenRepository = (0, db_1.getRepositoryUserPermissionTokenRepository)();
const manualInvoiceRepository = (0, db_1.getManualInvoiceRepository)();
const financialIssueRepository = (0, FinancialIssue_repository_1.getFinancialIssueRepository)();
const mailService = new services_1.MailService();
class AdminController {
    static createAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const created = yield addressRepository.create(req.body);
            const response = {
                createdAddressId: created.id,
            };
            res.status(http_status_codes_1.StatusCodes.CREATED).send({ success: response });
        });
    }
    static createCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const created = yield companyRepository.create(req.body);
            const response = {
                createdCompanyId: created.id,
            };
            res.status(http_status_codes_1.StatusCodes.CREATED).send({ success: response });
        });
    }
    static sendCompanyAdminInvite(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const [token, expiresAt] = utils_1.secureToken.generate({
                email: req.body.userEmail,
            });
            const createCompanyUserPermissionTokenBody = {
                userName: req.body.userName,
                userEmail: req.body.userEmail,
                token: token,
                companyId: req.body.companyId,
                companyUserRole: req.body.companyUserRole,
                expiresAt: expiresAt,
            };
            const existing = yield companyUserPermissionTokenRepository.getByUserEmail(req.body.userEmail, req.body.companyId);
            for (const permission of existing) {
                yield companyUserPermissionTokenRepository.delete(permission.token);
            }
            yield companyUserPermissionTokenRepository.create(createCompanyUserPermissionTokenBody);
            yield mailService.sendCompanyAdminInvite(req.body.userName, req.body.userEmail, token);
            const response = {};
            res.status(http_status_codes_1.StatusCodes.OK).send({ success: response });
        });
    }
    static sendRepositoryAdminInvite(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const [token, expiresAt] = utils_1.secureToken.generate({
                email: req.body.userEmail,
            });
            // TODO: that is a hack to put the repositoryId in DB if it does not exist
            const [owner, repository] = yield financialIssueRepository.getRepository(req.body.repositoryId);
            const createRepositoryUserPermissionTokenDto = {
                userName: req.body.userName,
                userEmail: req.body.userEmail,
                userGithubOwnerLogin: req.body.userGithubOwnerLogin,
                token: token,
                repositoryId: repository.id,
                repositoryUserRole: req.body.repositoryUserRole,
                dowRate: new decimal_js_1.default(req.body.dowRate),
                dowCurrency: req.body.dowCurrency,
                expiresAt: expiresAt,
            };
            const existing = yield repositoryUserPermissionTokenRepository.getByUserGithubOwnerLogin(req.body.userGithubOwnerLogin);
            if (existing) {
                yield repositoryUserPermissionTokenRepository.delete(existing.token);
            }
            yield repositoryUserPermissionTokenRepository.create(createRepositoryUserPermissionTokenDto);
            yield mailService.sendRepositoryAdminInvite(req.body.userName, req.body.userEmail, token);
            const response = {};
            res.status(http_status_codes_1.StatusCodes.OK).send({ success: response });
        });
    }
    static createManualInvoice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const created = yield manualInvoiceRepository.create(req.body);
            const response = {
                createdInvoiceId: created.id,
            };
            res.status(http_status_codes_1.StatusCodes.CREATED).send({ success: response });
        });
    }
}
exports.AdminController = AdminController;
