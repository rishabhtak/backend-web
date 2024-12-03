import { setupTestDB } from "../../__helpers__/jest.setup";
import { getOwnerRepository } from "../../../db";
import { Fixture } from "../../__helpers__/Fixture";
import { OwnerId } from "../../../model";

describe("OwnerRepository", () => {
  setupTestDB();

  const repo = getOwnerRepository();

  describe("create", () => {
    describe("insert", () => {
      it("should work", async () => {
        const ownerId = Fixture.ownerId();
        const owner = Fixture.owner(ownerId);
        const created = await repo.insertOrUpdate(owner);

        expect(created).toEqual(owner);

        const found = await repo.getById(owner.id);
        expect(found).toEqual(owner);
      });
    });

    describe("update", () => {
      it("should work", async () => {
        const ownerId = Fixture.ownerId();
        const owner = Fixture.owner(ownerId);
        await repo.insertOrUpdate(owner);

        const updatedOwner = Fixture.owner(ownerId, "updated-payload");
        const updated = await repo.insertOrUpdate(updatedOwner);

        expect(updated).toEqual(updatedOwner);

        const found = await repo.getById(owner.id);
        expect(found).toEqual(updatedOwner);
      });
    });
  });

  describe("getById", () => {
    it("should return null if owner not found", async () => {
      const nonExistentOwnerId = Fixture.ownerId();
      const found = await repo.getById(nonExistentOwnerId);

      expect(found).toBeNull();
    });

    it("succeed when github ids are not given", async () => {
      const ownerId = Fixture.ownerId();
      const owner = Fixture.owner(ownerId);
      await repo.insertOrUpdate(owner);

      const undefinedOwnerId = new OwnerId(ownerId.login, undefined);

      const found = await repo.getById(undefinedOwnerId);
      expect(found).toEqual(owner);
    });
  });

  describe("getAll", () => {
    it("should return all owners", async () => {
      const ownerId1 = Fixture.ownerId();
      const ownerId2 = Fixture.ownerId();

      const owner1 = Fixture.owner(ownerId1, "payload1");
      const owner2 = Fixture.owner(ownerId2, "payload2");

      await repo.insertOrUpdate(owner1);
      await repo.insertOrUpdate(owner2);

      const allOwners = await repo.getAll();

      expect(allOwners).toHaveLength(2);
      expect(allOwners).toContainEqual(owner1);
      expect(allOwners).toContainEqual(owner2);
    });

    it("should return an empty array if no owners exist", async () => {
      const allOwners = await repo.getAll();

      expect(allOwners).toEqual([]);
    });
  });
});
