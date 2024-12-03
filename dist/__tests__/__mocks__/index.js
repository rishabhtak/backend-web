"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockResponse = exports.mockRequest = void 0;
const globals_1 = require("@jest/globals");
// Ensure mockRequest includes all necessary properties
exports.mockRequest = {
    params: {},
    body: {},
    query: {},
    // Add other properties if needed, for example:
    headers: {},
    get: globals_1.jest.fn(),
    // ... add any other properties required by your controller
};
// Ensure mockResponse includes all necessary methods
exports.mockResponse = {
    sendStatus: globals_1.jest.fn(),
    send: globals_1.jest.fn(),
    status: globals_1.jest.fn(() => exports.mockResponse),
    json: globals_1.jest.fn(), // Add json method if it's used in your controller
};
