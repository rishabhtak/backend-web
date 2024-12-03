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
exports.encrypt = void 0;
var bcrypt = require("bcryptjs");
// TODO
const saltRounds = 10;
class encrypt {
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = bcrypt.genSaltSync(saltRounds);
            return bcrypt.hashSync(password, salt);
        });
    }
    static comparePassword(password, hashPassword) {
        return bcrypt.compareSync(password, hashPassword);
    }
}
exports.encrypt = encrypt;
