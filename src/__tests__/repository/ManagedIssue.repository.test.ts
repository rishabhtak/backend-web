import { setupTestDB } from "../__helpers__/jest.setup";
import { ManagedIssueId, ManagedIssueState, UserId } from "../../model";
import {
  getIssueRepository,
  getManagedIssueRepository,
  getOwnerRepository,
  getRepositoryRepository,
  getUserRepository,
} from "../../db/";
import { CreateManagedIssueBody } from "../../dtos";
import { Fixture } from "../__helpers__/Fixture";
import { v4 as uuidv } from "uuid";

describe("ManagedIssueRepository", () => {
  const userRepo = getUserRepository();
  const ownerRepo = getOwnerRepository();
  const repoRepo = getRepositoryRepository();
  const issueRepo = getIssueRepository();
  const managedIssueRepo = getManagedIssueRepository();

  setupTestDB();
  let validUserId: UserId;

  beforeEach(async () => {
    const validUser = await userRepo.insert(
      Fixture.createUser(Fixture.localUser()),
    );
    validUserId = validUser.id;
  });

  describe("create", () => {
    it("should create a new managed issue record", async () => {
      const ownerId = Fixture.ownerId();
      await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

      const repositoryId = Fixture.repositoryId(ownerId);
      await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

      const issueId = Fixture.issueId(repositoryId);
      const issue = Fixture.issue(issueId, ownerId);
      await issueRepo.createOrUpdate(issue);

      const managedIssueBody = Fixture.createManagedIssueBody(
        issueId,
        validUserId,
      );

      const created = await managedIssueRepo.create(managedIssueBody);

      expect(created).toEqual(
        Fixture.managedIssueFromBody(created.id, managedIssueBody),
      );

      const found = await managedIssueRepo.getById(
        new ManagedIssueId(created.id.uuid),
      );
      expect(found).toEqual(created);
    });

    // Add more test cases for `create`:
    // - Test with invalid data (e.g., negative amount, invalid enum values)
    // - Verify error handling and database constraints
  });

  describe("update", () => {
    it("should update an existing managed issue record", async () => {
      const ownerId = Fixture.ownerId();
      await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

      const repositoryId = Fixture.repositoryId(ownerId);
      await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

      const issueId = Fixture.issueId(repositoryId);
      const issue = Fixture.issue(issueId, ownerId);
      await issueRepo.createOrUpdate(issue);

      const managedIssueBody = Fixture.createManagedIssueBody(
        issueId,
        validUserId,
      );

      const created = await managedIssueRepo.create(managedIssueBody);

      expect(created).toEqual(
        Fixture.managedIssueFromBody(created.id, managedIssueBody),
      );

      const updatedManagedIssueBody: CreateManagedIssueBody = {
        ...managedIssueBody,
        state: ManagedIssueState.SOLVED, // Update the state
      };

      const updated = await managedIssueRepo.update(
        Fixture.managedIssueFromBody(created.id, updatedManagedIssueBody),
      );

      expect(created.id).toEqual(updated.id);
      expect(updated).toEqual(
        Fixture.managedIssueFromBody(created.id, updatedManagedIssueBody),
      );

      const found = await managedIssueRepo.getById(updated.id);
      expect(found).toEqual(updated);
    });

    // Add more test cases for `update`:
    // - Test updating different fields
    // - Test updating a non-existent record
    // - Verify error handling and database constraints
  });

  describe("getById", () => {
    it("should return null if managed issue not found", async () => {
      const nonExistentManagedIssueId = new ManagedIssueId(uuidv());
      const found = await managedIssueRepo.getById(nonExistentManagedIssueId);

      expect(found).toBeNull();
    });

    // Add more test cases for `getById`:
    // - Test retrieving an existing record
  });
});
