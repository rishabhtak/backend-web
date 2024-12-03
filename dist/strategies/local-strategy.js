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
const passport_local_1 = require("passport-local");
const utils_1 = require("../utils");
const db_1 = require("../db/");
const model_1 = require("../model");
const repo = (0, db_1.getUserRepository)();
// TODO: do something more secure
const superAdminEmails = ["lauriane@open-source-economy.com"];
passport_1.default.use("local-login", 
// email field in the request body and send that as argument for the username
new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
}, (username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield repo.findOne(username);
        if (!user) {
            return done(null, false, {
                message: "Incorrect username or password.",
            });
        }
        else if (!(user.data instanceof model_1.LocalUser)) {
            return done(null, false, {
                message: "Already registered with a third party",
            });
        }
        else if (!utils_1.encrypt.comparePassword(password, user.data.password)) {
            return done(null, false, {
                message: "Incorrect username or password.",
            });
        }
        else {
            return done(null, user); // user object attaches to the request as req.user
        }
    }
    catch (err) {
        return done(err);
    }
})));
passport_1.default.use("local-register", new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
}, (req, email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield repo.findOne(email);
        if (user) {
            if (!(user.data instanceof model_1.LocalUser)) {
                return done(null, false, {
                    message: "Already registered with a third party",
                });
            }
            else if (!utils_1.encrypt.comparePassword(password, user.data.password)) {
                return done(null, false, {
                    message: "Incorrect username or password.",
                });
            }
            else {
                return done(null, user); // user object attaches to the request as req.user
            }
        }
        const createUser = {
            name: req.body.name,
            data: new model_1.LocalUser(email, false, password),
            role: superAdminEmails.includes(email.trim())
                ? model_1.UserRole.SUPER_ADMIN
                : model_1.UserRole.USER,
        };
        const savedUser = yield repo.insert(createUser);
        return done(null, savedUser);
    }
    catch (err) {
        return done(err);
    }
})));
