"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = exports.CompanyId = void 0;
const Address_1 = require("./Address");
const error_1 = require("./error");
class CompanyId {
    constructor(uuid) {
        this.uuid = uuid;
    }
    toString() {
        return this.uuid.toString();
    }
}
exports.CompanyId = CompanyId;
class Company {
    constructor(id, taxId, name, addressId = null) {
        this.id = id;
        this.taxId = taxId;
        this.name = name;
        this.addressId = addressId;
    }
    static fromBackend(row) {
        const validator = new error_1.Validator(row);
        const id = validator.requiredString("id");
        const taxId = validator.optionalString("tax_id");
        const name = validator.requiredString("name");
        const addressId = validator.optionalString("address_id");
        const error = validator.getFirstError();
        if (error) {
            return error;
        }
        return new Company(new CompanyId(id), taxId !== null && taxId !== void 0 ? taxId : null, name, addressId ? new Address_1.AddressId(addressId) : null);
    }
}
exports.Company = Company;
