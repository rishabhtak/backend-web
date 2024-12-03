import { setupTestDB } from "../__helpers__/jest.setup";
import {
  getOwnerRepository,
  getRepositoryRepository,
  getUserRepository,
  getUserRepositoryRepository,
} from "../../db";
import { Fixture } from "../__helpers__/Fixture";
import { RepositoryUserRole, UserId } from "../../model";

describe("UserRepositoryRepository", () => {
  const userRepo = getUserRepository();
  const ownerRepo = getOwnerRepository();
  const repositoryRepo = getRepositoryRepository();
  const userRepositoryRepo = getUserRepositoryRepository();

  setupTestDB();
  let userId: UserId;
  const ownerId = Fixture.ownerId();
  const repositoryId = Fixture.repositoryId(ownerId);

  beforeEach(async () => {
    const validUser = await userRepo.insert(
      Fixture.createUser(Fixture.localUser()),
    );
    userId = validUser.id;

    await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));
    await repositoryRepo.insertOrUpdate(Fixture.repository(repositoryId));
  });

  describe("create", () => {
    it("should create a new user repository record", async () => {
      const userRepository = Fixture.userRepository(userId, repositoryId);
      const created = await userRepositoryRepo.create(userRepository);
      expect(created.repositoryId).toEqual(repositoryId);
    });
  });

  describe("getById", () => {
    it("should return the user repository by user id and repository id", async () => {
      const userRepository = Fixture.userRepository(userId, repositoryId);
      await userRepositoryRepo.create(userRepository);
      const found = await userRepositoryRepo.getById(userId, repositoryId);
      expect(found).not.toBeNull();
      expect(found!.repositoryId).toEqual(repositoryId);
    });
  });

  describe("update", () => {
    it("should update an existing user repository record", async () => {
      const userRepository = Fixture.userRepository(userId, repositoryId);
      const created = await userRepositoryRepo.create(userRepository);

      created.repositoryUserRole = RepositoryUserRole.ADMIN;
      const updated = await userRepositoryRepo.update(created);
      expect(updated.repositoryUserRole).toEqual(RepositoryUserRole.ADMIN);
    });
  });

  describe("delete", () => {
    it("should delete a user repository record", async () => {
      const userRepository = Fixture.userRepository(userId, repositoryId);
      await userRepositoryRepo.create(userRepository);
      await userRepositoryRepo.delete(userId, repositoryId);
      const found = await userRepositoryRepo.getById(userId, repositoryId);
      expect(found).toBeNull();
    });
  });
});
