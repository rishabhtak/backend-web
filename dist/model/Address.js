"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = exports.AddressId = void 0;
const error_1 = require("./error");
class AddressId {
    constructor(uuid) {
        this.uuid = uuid;
    }
    toString() {
        return this.uuid;
    }
}
exports.AddressId = AddressId;
class Address {
    constructor(id, companyName, line1, line2, city, state, postalCode, country) {
        this.id = id;
        this.name = companyName;
        this.line1 = line1;
        this.line2 = line2;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
    }
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        const id = validator.requiredString("id");
        const name = validator.optionalString("name");
        const line1 = validator.optionalString("line_1");
        const line2 = validator.optionalString("line_2");
        const city = validator.optionalString("city");
        const state = validator.optionalString("state");
        const postalCode = validator.optionalString("postal_code");
        const country = validator.optionalString("country");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new Address(new AddressId(id), name, line1, line2, city, state, postalCode, country);
    }
}
exports.Address = Address;
