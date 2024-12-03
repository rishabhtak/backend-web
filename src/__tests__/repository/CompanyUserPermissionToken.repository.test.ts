import { setupTestDB } from "../__helpers__/jest.setup";
import { CompanyId, CompanyUserPermissionTokenId } from "../../model";
import {
  getCompanyRepository,
  getCompanyUserPermissionTokenRepository,
} from "../../db";
import { CreateCompanyUserPermissionTokenBody } from "../../dtos";
import { Fixture } from "../__helpers__/Fixture";

describe("CompanyUserPermissionTokenRepository", () => {
  const companyRepo = getCompanyRepository();
  const tokenRepo = getCompanyUserPermissionTokenRepository();

  setupTestDB();
  let companyId: CompanyId;

  beforeEach(async () => {
    const company = await companyRepo.create(Fixture.createCompanyBody());
    companyId = company.id;
  });

  describe("create", () => {
    it("should create a new token record", async () => {
      const tokenBody = Fixture.createUserCompanyPermissionTokenBody(
        "test@example.com",
        companyId,
      );

      const created = await tokenRepo.create(tokenBody);

      expect(created).toEqual(
        Fixture.userCompanyPermissionTokenFromBody(created.id, tokenBody),
      );

      const found = await tokenRepo.getById(created.id);
      expect(found).toEqual(created);
    });

    // Add more test cases for `create`
  });

  describe("update", () => {
    it("should update an existing token record", async () => {
      const tokenBody = Fixture.createUserCompanyPermissionTokenBody(
        "test@example.com",
        companyId,
      );

      const created = await tokenRepo.create(tokenBody);
      expect(created).toEqual(
        Fixture.userCompanyPermissionTokenFromBody(created.id, tokenBody),
      );

      const updatedTokenBody: CreateCompanyUserPermissionTokenBody = {
        ...tokenBody,
        userEmail: "updated@example.com",
      };

      const updated = await tokenRepo.update(
        Fixture.userCompanyPermissionTokenFromBody(
          created.id,
          updatedTokenBody,
        ),
      );

      expect(created.id).toEqual(updated.id);
      expect(updated.userEmail).toEqual("updated@example.com");
    });

    // Add more test cases for `update`
  });

  describe("getById", () => {
    it("should return null if token not found", async () => {
      const nonExistentTokenId = new CompanyUserPermissionTokenId(
        Fixture.uuid(),
      );
      const found = await tokenRepo.getById(nonExistentTokenId);

      expect(found).toBeNull();
    });

    // Add more test cases for `getById`
  });

  describe("getByUserEmail", () => {
    it("should return tokens for a specific user email", async () => {
      const tokenBody = Fixture.createUserCompanyPermissionTokenBody(
        "test@example.com",
        companyId,
      );

      await tokenRepo.create(tokenBody);

      const found = await tokenRepo.getByUserEmail(
        "test@example.com",
        companyId,
      );
      expect(found.length).toBeGreaterThan(0);
      expect(found[0].userEmail).toEqual("test@example.com");
    });

    // Add more test cases for `getByUserEmail`
  });

  describe("getByToken", () => {
    it("should return token", async () => {
      const tokenBody = Fixture.createUserCompanyPermissionTokenBody(
        "test@example.com",
        companyId,
      );

      const created = await tokenRepo.create(tokenBody);

      const found = await tokenRepo.getByToken(created.token);
      expect(found).toEqual(created);
    });

    // Add more test cases for `getByToken`
  });

  describe("delete", () => {
    it("should should", async () => {
      const tokenBody = Fixture.createUserCompanyPermissionTokenBody(
        "test@example.com",
        companyId,
      );

      const created = await tokenRepo.create(tokenBody);

      const found = await tokenRepo.getByToken(created.token);
      expect(found).toEqual(created);

      await tokenRepo.delete(created.token);
      const notFound = await tokenRepo.getByToken(created.token);

      expect(notFound).toBe(null);
    });
  });
});
