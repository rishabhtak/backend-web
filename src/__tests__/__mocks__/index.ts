import { Request, Response } from "express";
import { jest } from "@jest/globals";

// Ensure mockRequest includes all necessary properties
export const mockRequest = {
  params: {},
  body: {},
  query: {},
  // Add other properties if needed, for example:
  headers: {},
  get: jest.fn(),
  // ... add any other properties required by your controller
} as unknown as Request;

// Ensure mockResponse includes all necessary methods
export const mockResponse = {
  sendStatus: jest.fn(),
  send: jest.fn(),
  status: jest.fn(() => mockResponse),
  json: jest.fn(), // Add json method if it's used in your controller
} as unknown as Response;
