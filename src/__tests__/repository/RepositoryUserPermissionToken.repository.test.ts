import { setupTestDB } from "../__helpers__/jest.setup";
import {
  CreateRepositoryUserPermissionTokenDto,
  getOwnerRepository,
  getRepositoryRepository,
  getRepositoryUserPermissionTokenRepository,
} from "../../db";
import { Fixture } from "../__helpers__/Fixture";
import { RepositoryUserPermissionTokenId } from "../../model";

describe("RepositoryUserPermissionTokenRepository", () => {
  const ownerRepo = getOwnerRepository();
  const repositoryRepo = getRepositoryRepository();
  const tokenRepo = getRepositoryUserPermissionTokenRepository();

  setupTestDB();
  const ownerId = Fixture.ownerId();
  const repositoryId = Fixture.repositoryId(ownerId);

  beforeEach(async () => {
    await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));
    await repositoryRepo.insertOrUpdate(Fixture.repository(repositoryId));
  });

  describe("create", () => {
    it("should create a new token record", async () => {
      const tokenBody =
        Fixture.createRepositoryUserPermissionTokenBody(repositoryId);

      const created = await tokenRepo.create(tokenBody);
      expect(created).toEqual(
        Fixture.repositoryUserPermissionTokenFromBody(created.id, tokenBody),
      );
    });
  });

  describe("update", () => {
    it("should update an existing token record", async () => {
      const tokenBody =
        Fixture.createRepositoryUserPermissionTokenBody(repositoryId);

      const created = await tokenRepo.create(tokenBody);

      const updatedTokenBody: CreateRepositoryUserPermissionTokenDto = {
        ...tokenBody,
        userGithubOwnerLogin: "updatedUser",
      };

      const updated = await tokenRepo.update(
        Fixture.repositoryUserPermissionTokenFromBody(
          created.id,
          updatedTokenBody,
        ),
      );

      expect(updated).toEqual(
        Fixture.repositoryUserPermissionTokenFromBody(
          created.id,
          updatedTokenBody,
        ),
      );
    });
  });

  describe("getById", () => {
    it("should return null if token not found", async () => {
      const nonExistentTokenId = new RepositoryUserPermissionTokenId(
        Fixture.uuid(),
      );
      const found = await tokenRepo.getById(nonExistentTokenId);
      expect(found).toBeNull();
    });

    it("should return token by id", async () => {
      const tokenBody =
        Fixture.createRepositoryUserPermissionTokenBody(repositoryId);

      const created = await tokenRepo.create(tokenBody);
      const found = await tokenRepo.getById(created.id);
      expect(found).toEqual(created);
    });
  });

  describe("getByRepositoryId", () => {
    it("should return tokens for a specific repository", async () => {
      const tokenBody =
        Fixture.createRepositoryUserPermissionTokenBody(repositoryId);

      await tokenRepo.create(tokenBody);
      const found = await tokenRepo.getByRepositoryId(repositoryId);
      expect(found.length).toBeGreaterThan(0);
      expect(found[0].repositoryId).toEqual(repositoryId);
    });
  });

  describe("getByToken", () => {
    it("should return token by token value", async () => {
      const tokenBody =
        Fixture.createRepositoryUserPermissionTokenBody(repositoryId);

      const created = await tokenRepo.create(tokenBody);
      const found = await tokenRepo.getByToken(created.token);
      expect(found).toEqual(created);
    });
  });

  describe("getAll", () => {
    it("should return all tokens", async () => {
      const tokenBody1 =
        Fixture.createRepositoryUserPermissionTokenBody(repositoryId);
      const tokenBody2 =
        Fixture.createRepositoryUserPermissionTokenBody(repositoryId);

      await tokenRepo.create(tokenBody1);
      await tokenRepo.create(tokenBody2);

      const allTokens = await tokenRepo.getAll();
      expect(allTokens.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("delete", () => {
    it("should delete a token by token value", async () => {
      const tokenBody =
        Fixture.createRepositoryUserPermissionTokenBody(repositoryId);

      const created = await tokenRepo.create(tokenBody);
      await tokenRepo.delete(created.token);

      const found = await tokenRepo.getByToken(created.token);
      expect(found).toBeNull();
    });
  });
});
