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
const passport_1 = __importDefault(require("passport"));
const passport_github_1 = require("passport-github");
const db_1 = require("../db/");
const model_1 = require("../model");
const config_1 = require("../config");
const error_1 = require("../model/error");
const ApiError_1 = require("../model/error/ApiError");
const http_status_codes_1 = require("http-status-codes");
const repo = (0, db_1.getUserRepository)();
passport_1.default.use(new passport_github_1.Strategy({
    clientID: config_1.config.github.clientId,
    clientSecret: config_1.config.github.clientSecret,
    callbackURL: "/api/v1/auth/redirect/github",
    scope: ["user:email"], // Request additional GitHub user data like email
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const thirdPartyUserId = new model_1.ThirdPartyUserId(profile.id);
        const findUser = yield repo.findByThirdPartyId(thirdPartyUserId, model_1.Provider.Github);
        // TODO: does not work, repositoryUserPermissionToken is undefined...
        // @ts-ignore
        const repositoryUserPermissionToken = req.repositoryUserPermissionToken;
        if (!findUser) {
            const thirdPartyUser = model_1.ThirdPartyUser.fromJson(profile);
            let createUser;
            if (thirdPartyUser instanceof error_1.ValidationError) {
                return done(thirdPartyUser); // Properly handling the validation error
            }
            else if (repositoryUserPermissionToken) {
                // if the user has received a repository user permission token (to get some rights about a repository)
                if (thirdPartyUser.providerData.owner.id.login !==
                    repositoryUserPermissionToken.userGithubOwnerLogin) {
                    return done(new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Wrong GitHub login. Please use the GitHub account that was invited to the repository."));
                }
                else {
                    thirdPartyUser.email = repositoryUserPermissionToken.userEmail;
                    createUser = {
                        name: repositoryUserPermissionToken.userName,
                        data: thirdPartyUser,
                        role: model_1.UserRole.USER,
                    };
                }
            }
            else {
                createUser = {
                    name: null,
                    data: thirdPartyUser,
                    role: model_1.UserRole.USER,
                };
            }
            const newSavedUser = yield repo.insert(createUser);
            return done(null, newSavedUser);
        }
        return done(null, findUser);
    }
    catch (err) {
        return done(err); // Handling any unexpected errors during authentication
    }
})));
