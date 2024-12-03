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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const model_1 = require("../model");
const http_status_codes_1 = require("http-status-codes");
const utils_1 = require("../utils");
const db_1 = require("../db");
const ApiError_1 = require("../model/error/ApiError");
const config_1 = require("../config");
const userRepo = (0, db_1.getUserRepository)();
const companyRepo = (0, db_1.getCompanyRepository)();
const companyUserPermissionTokenRepo = (0, db_1.getCompanyUserPermissionTokenRepository)();
const userCompanyRepo = (0, db_1.getUserCompanyRepository)();
const repositoryUserPermissionTokenRepo = (0, db_1.getRepositoryUserPermissionTokenRepository)();
const userRepositoryRepo = (0, db_1.getUserRepositoryRepository)();
class AuthController {
    // TODO: probably put info of the company in the session, to to much avoid request to the DB.
    //       Now, it is not the best implementation, but it works for now
    static getCompanyRoles(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let company = null;
            let companyRole = null;
            const companyRoles = yield userCompanyRepo.getByUserId(userId);
            if (companyRoles.length > 1) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_IMPLEMENTED, "User has multiple company roles");
            }
            else if (companyRoles.length === 1) {
                const [companyId, role] = companyRoles[0];
                company = yield companyRepo.getById(companyId);
                companyRole = role;
            }
            return [company, companyRole];
        });
    }
    static getRepositoryInfos(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepos = yield userRepositoryRepo.getAll(userId);
            return userRepos.map((userRepo) => {
                const info = {
                    role: userRepo.repositoryUserRole,
                    dowRate: userRepo.dowRate.toString(),
                    dowCurrency: userRepo.dowCurrency,
                };
                return [userRepo.repositoryId, info];
            });
        });
    }
    static status(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.isAuthenticated() && req.user) {
                const [company, companyRole] = yield AuthController.getCompanyRoles(req.user.id);
                const repositories = yield AuthController.getRepositoryInfos(req.user.id);
                const response = {
                    user: req.user,
                    company: company,
                    companyRole: companyRole,
                    repositories: repositories,
                };
                return res.status(http_status_codes_1.StatusCodes.OK).send({ success: response }); // TODO: json instead of send ?
            }
            else {
                const response = {
                    user: null,
                    company: null,
                    companyRole: null,
                    repositories: [],
                };
                return res.status(http_status_codes_1.StatusCodes.OK).send({ success: response });
            }
        });
    }
    static verifyCompanyToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.query.companyToken;
            if (token) {
                const companyUserPermissionToken = yield companyUserPermissionTokenRepo.getByToken(token);
                const tokenData = yield utils_1.secureToken.verify(token);
                if (companyUserPermissionToken === null) {
                    next(new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Token invalid"));
                }
                else if ((companyUserPermissionToken === null || companyUserPermissionToken === void 0 ? void 0 : companyUserPermissionToken.userEmail) !== req.body.email) {
                    next(new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Token invalid"));
                }
                else if ((companyUserPermissionToken === null || companyUserPermissionToken === void 0 ? void 0 : companyUserPermissionToken.userEmail) !== tokenData.email) {
                    next(new ApiError_1.ApiError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Tokens are not matching"));
                }
                else if (companyUserPermissionToken.expiresAt < new Date()) {
                    next(new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Token expired"));
                }
                else {
                    // Pass the verified token if needed
                    // @ts-ignore TODO: why is this not working?
                    req.companyUserPermissionToken = companyUserPermissionToken;
                    next();
                }
            }
            else {
                return next(new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, "No company token provided"));
            }
        });
    }
    static registerAsCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // TODO: improve
            // @ts-ignore TODO: why is this not working?
            const companyUserPermissionToken = req.companyUserPermissionToken;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // TODO: improve
            yield userRepo.validateEmail(req.body.email);
            yield userCompanyRepo.insert(userId, companyUserPermissionToken.companyId, companyUserPermissionToken.companyUserRole);
            if (companyUserPermissionToken.token) {
                yield companyUserPermissionTokenRepo.delete(companyUserPermissionToken.token);
            }
            res.sendStatus(http_status_codes_1.StatusCodes.CREATED);
        });
    }
    static verifyRepositoryToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("verifyRepositoryToken");
            const token = req.query.repositoryToken;
            if (token) {
                const repositoryUserPermissionToken = yield repositoryUserPermissionTokenRepo.getByToken(token);
                const tokenData = yield utils_1.secureToken.verify(token);
                if (repositoryUserPermissionToken === null) {
                    next(new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Token invalid"));
                }
                else if (repositoryUserPermissionToken.expiresAt < new Date()) {
                    next(new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Token expired"));
                }
                else {
                    // Pass the verified token if needed
                    // @ts-ignore TODO: why is this not working?
                    req.repositoryUserPermissionToken = repositoryUserPermissionToken;
                    next();
                }
            }
            else {
                return next(new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, "No repository token provided"));
            }
        });
    }
    static registerForRepository(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const userData = (_a = req.user) === null || _a === void 0 ? void 0 : _a.data;
            const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id; // TODO: improve
            if (!(userData instanceof model_1.ThirdPartyUser)) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User is not a third party user");
            }
            const repositoryUserPermissionToken = yield repositoryUserPermissionTokenRepo.getByUserGithubOwnerLogin(userData.providerData.owner.id.login);
            if (repositoryUserPermissionToken) {
                const userRepository = new model_1.UserRepository(userId, repositoryUserPermissionToken.repositoryId, repositoryUserPermissionToken.repositoryUserRole, repositoryUserPermissionToken.dowRate, repositoryUserPermissionToken.dowCurrency);
                yield userRepositoryRepo.create(userRepository);
                if (repositoryUserPermissionToken.token) {
                    yield repositoryUserPermissionTokenRepo.delete(repositoryUserPermissionToken.token);
                }
            }
            const redirectUrl = `http://localhost:3000/`; // TODO: IMPORTANT
            res.redirect(redirectUrl);
        });
    }
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = {
                user: req.user,
                company: null,
                companyRole: null,
                repositories: [],
            };
            return res.status(http_status_codes_1.StatusCodes.CREATED).send({ success: response });
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.isAuthenticated() && req.user) {
                // TODO: refactor this: copy-paste in status
                const user = req.user;
                const [company, companyRole] = yield AuthController.getCompanyRoles(req.user.id);
                const repositories = yield AuthController.getRepositoryInfos(req.user.id);
                const response = {
                    user: user,
                    company,
                    companyRole,
                    repositories,
                };
                return res.status(http_status_codes_1.StatusCodes.OK).send({ success: response });
            }
            else {
                return res.sendStatus(http_status_codes_1.StatusCodes.UNAUTHORIZED);
            }
        });
    }
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                return res.sendStatus(http_status_codes_1.StatusCodes.OK);
            req.logout((err) => {
                if (err)
                    return res.sendStatus(http_status_codes_1.StatusCodes.BAD_REQUEST);
                res.sendStatus(http_status_codes_1.StatusCodes.OK);
            });
        });
    }
    static getCompanyUserInviteInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const companyUserPermissionToken = yield companyUserPermissionTokenRepo.getByToken(query.token);
            if (companyUserPermissionToken === null) {
                config_1.logger.debug(`Token invalid or expired: ${query.token}`);
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, `Token invalid or expired`);
            }
            else if (companyUserPermissionToken.expiresAt < new Date()) {
                config_1.logger.debug(`Token invalid or expired: ${query.token}`);
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, `Token invalid or expired`);
            }
            else {
                const response = {
                    userName: companyUserPermissionToken.userName,
                    userEmail: companyUserPermissionToken.userEmail,
                };
                return res.status(http_status_codes_1.StatusCodes.OK).send({ success: response });
            }
        });
    }
    static getRepositoryUserInviteInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const repositoryUserPermissionToken = yield repositoryUserPermissionTokenRepo.getByToken(query.token);
            if (repositoryUserPermissionToken === null) {
                config_1.logger.debug(`Token invalid or expired: ${query.token}`);
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, `Token invalid or expired`);
            }
            else if (repositoryUserPermissionToken.expiresAt < new Date()) {
                config_1.logger.debug(`Token invalid or expired: ${query.token}`);
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, `Token invalid or expired`);
            }
            else {
                const response = {
                    userName: repositoryUserPermissionToken.userName,
                    userGithubOwnerLogin: repositoryUserPermissionToken.userGithubOwnerLogin,
                    repositoryId: repositoryUserPermissionToken.repositoryId,
                };
                return res.status(http_status_codes_1.StatusCodes.OK).send({ success: response });
            }
        });
    }
}
exports.AuthController = AuthController;
