"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = exports.ValidationError = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
class ValidationError extends Error {
    constructor(message, data) {
        super(`${message}. Received: ${JSON.stringify(data, null, 2)}`);
    }
}
exports.ValidationError = ValidationError;
class FieldValidationError extends ValidationError {
    constructor(path, value, data, type) {
        const p = typeof path === "string" ? path : path.join(".");
        super(`Invalid type: field "${p}", of value ${value} is not a ${type}`, data);
    }
}
class StringValidationError extends FieldValidationError {
    constructor(path, value, data) {
        super(path, value, data, "string");
    }
}
class NumberValidationError extends FieldValidationError {
    constructor(path, value, data) {
        super(path, value, data, "number");
    }
}
class BooleanValidationError extends FieldValidationError {
    constructor(path, value, data) {
        super(path, value, data, "boolean");
    }
}
class ArrayValidationError extends FieldValidationError {
    constructor(path, value, data) {
        super(path, value, data, "array");
    }
}
class ObjectValidationError extends FieldValidationError {
    constructor(path, value, data) {
        super(path, value, data, "object");
    }
}
class EnumValidationError extends ValidationError {
    constructor(path, data, enumType) {
        const p = typeof path === "string" ? path : path.join(".");
        super(`${p}" is not contained in enum type ${enumType}`, data);
    }
}
class DateValidationError extends FieldValidationError {
    constructor(path, value, data) {
        super(path, value, data, "Date");
    }
}
class Validator {
    constructor(data) {
        this.errors = [];
        this.data = data;
    }
    getValue(path) {
        if (typeof path === "string") {
            return this.data[path];
        }
        else if (Array.isArray(path)) {
            return this.getValueFromPath(path);
        }
    }
    getValueFromPath(path) {
        let value = this.data;
        for (const key of path) {
            value = value[key];
            if (value === undefined) {
                return undefined;
            }
        }
        return value;
    }
    getFirstError() {
        return this.errors[0] || null;
    }
    optionalString(path) {
        const value = this.getValue(path);
        if (value === undefined || value === null) {
        }
        else if (typeof value !== "string") {
            this.errors.push(new StringValidationError(path, value, this.data));
        }
        else {
            return value;
        }
    }
    // @ts-ignore
    requiredString(path) {
        const value = this.getValue(path);
        if (typeof value !== "string") {
            this.errors.push(new StringValidationError(path, value, this.data));
        }
        else {
            return value;
        }
    }
    optionalNumber(path) {
        let value = this.getValue(path);
        if (typeof value === "string") {
            value = parseFloat(value);
        }
        if (value === undefined || value === null) {
        }
        else if (typeof value !== "number") {
            this.errors.push(new NumberValidationError(path, this.data, value));
            return;
        }
        else {
            return value;
        }
    }
    // @ts-ignore
    requiredNumber(path) {
        let value = this.getValue(path);
        if (typeof value === "string") {
            value = parseFloat(value);
        }
        if (typeof value !== "number" || isNaN(value)) {
            this.errors.push(new NumberValidationError(path, value, this.data));
        }
        else {
            return value;
        }
    }
    // TODO: lolo
    // @ts-ignore
    requiredDecimal(path) {
        let value = this.getValue(path);
        if (typeof value === "string") {
            // Use Decimal.js to parse the string
            value = new decimal_js_1.default(value);
        }
        else if (typeof value === "number") {
            // Convert number to Decimal.js
            value = new decimal_js_1.default(value);
        }
        // Check if the value is a valid Decimal.js instance
        if (!(value instanceof decimal_js_1.default) || isNaN(value.toNumber())) {
            this.errors.push(new NumberValidationError(path, value, this.data));
        }
        else {
            return value;
        }
    }
    // @ts-ignore
    requiredBoolean(path) {
        const value = this.getValue(path);
        if (typeof value !== "boolean") {
            this.errors.push(new BooleanValidationError(path, value, this.data));
        }
        else {
            return value;
        }
    }
    optionalObject(path) {
        const value = this.getValue(path);
        if (value === undefined || value === null) {
        }
        else if (typeof value !== "object") {
            this.errors.push(new ObjectValidationError(path, value, this.data));
        }
    }
    // @ts-ignore
    requiredObject(path) {
        const value = this.getValue(path);
        if (typeof value !== "object") {
            this.errors.push(new ObjectValidationError(path, value, this.data));
        }
        else {
            return value;
        }
    }
    optionalArray(path) {
        const value = this.getValue(path);
        if (value === undefined || value === null) {
        }
        else if (!Array.isArray(value)) {
            this.errors.push(new ArrayValidationError(path, value, this.data));
        }
    }
    requiredArray(path) {
        const value = this.getValue(path);
        if (!Array.isArray(value)) {
            this.errors.push(new ArrayValidationError(path, value, this.data));
        }
    }
    requiredEnum(path, enumType) {
        const value = this.getValue(path);
        const enumValues = Object.values(enumType);
        if (!enumValues.includes(value)) {
            this.errors.push(new EnumValidationError(path, value, enumType));
        }
        else {
            return value;
        }
    }
    optionalDate(path) {
        const value = this.getValue(path);
        if (typeof value === "object") {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }
    // @ts-ignore
    requiredDate(path) {
        const value = this.getValue(path);
        if (typeof value === "object") {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        this.errors.push(new DateValidationError(path, value, this.data));
    }
}
exports.Validator = Validator;
