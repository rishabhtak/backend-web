import { setupTestDB } from "../__helpers__/jest.setup";
import { CompanyId, CompanyUserRole, IssueId, UserId } from "../../model";
import {
  getCompanyRepository,
  getDowNumberRepository,
  getIssueFundingRepository,
  getIssueRepository,
  getManualInvoiceRepository,
  getOwnerRepository,
  getRepositoryRepository,
  getUserCompanyRepository,
  getUserRepository,
} from "../../db/";
import { Fixture } from "../__helpers__/Fixture";
import { CreateIssueFundingBody, CreateManualInvoiceBody } from "../../dtos";
import Decimal from "decimal.js";

describe("DowNumberRepository", () => {
  const userRepo = getUserRepository();
  const companyRepo = getCompanyRepository();
  const userCompanyRepo = getUserCompanyRepository();
  const dowNumberRepo = getDowNumberRepository();

  const ownerRepo = getOwnerRepository();
  const repoRepo = getRepositoryRepository();
  const issueRepo = getIssueRepository();

  const issueFundingRepo = getIssueFundingRepository();
  const manualInvoiceRepo = getManualInvoiceRepository();

  setupTestDB();
  let lonelyUserId: UserId;
  let companyUserId1: UserId;
  let companyUserId2: UserId;
  let validCompanyId: CompanyId;
  let validIssueId: IssueId;

  beforeEach(async () => {
    const lonelyUser = await userRepo.insert(
      Fixture.createUser(Fixture.localUser()),
    );
    lonelyUserId = lonelyUser.id;

    const validCompany = await companyRepo.create(Fixture.createCompanyBody());
    validCompanyId = validCompany.id;

    const companyUser1 = await userRepo.insert(
      Fixture.createUser(Fixture.localUser()),
    );
    companyUserId1 = companyUser1.id;
    await userCompanyRepo.insert(
      companyUserId1,
      validCompanyId,
      CompanyUserRole.ADMIN,
    );

    const companyUser2 = await userRepo.insert(
      Fixture.createUser(Fixture.localUser()),
    );
    companyUserId2 = companyUser2.id;
    await userCompanyRepo.insert(
      companyUserId2,
      validCompanyId,
      CompanyUserRole.ADMIN,
    );

    const ownerId = Fixture.ownerId();
    await ownerRepo.insertOrUpdate(Fixture.owner(ownerId));

    const repositoryId = Fixture.repositoryId(ownerId);
    await repoRepo.insertOrUpdate(Fixture.repository(repositoryId));

    validIssueId = Fixture.issueId(repositoryId);
    await issueRepo.createOrUpdate(Fixture.issue(validIssueId, ownerId));
  });

  describe("getAvailableDoWs", () => {
    describe("should return 0", () => {
      it("for a user with no invoices nor issue funding", async () => {
        const totalDoWs = await dowNumberRepo.getAvailableDoWs(lonelyUserId);
        expect(totalDoWs).toEqual(new Decimal(0));
      });

      it("for a company with no invoices nor issue funding", async () => {
        const totalDoWs = await dowNumberRepo.getAvailableDoWs(
          companyUserId1,
          validCompanyId,
        );

        expect(totalDoWs).toEqual(new Decimal(0));
      });
    });

    describe("should return the amount manually added", () => {
      it("for a user", async () => {
        const manualInvoiceBody: CreateManualInvoiceBody = {
          ...Fixture.createManualInvoiceBody(undefined, lonelyUserId),
          dowAmount: new Decimal(200),
        };
        await manualInvoiceRepo.create(manualInvoiceBody);
        const totalDoWs = await dowNumberRepo.getAvailableDoWs(lonelyUserId);
        expect(totalDoWs).toEqual(new Decimal(200));
      });

      it("for a company", async () => {
        const manualInvoiceBody: CreateManualInvoiceBody = {
          ...Fixture.createManualInvoiceBody(validCompanyId),
          dowAmount: new Decimal(200),
        };
        await manualInvoiceRepo.create(manualInvoiceBody);
        const totalDoWs = await dowNumberRepo.getAvailableDoWs(
          companyUserId1,
          validCompanyId,
        );
        expect(totalDoWs).toEqual(new Decimal(200));
      });
    });

    describe("should return the amount added with stripe", () => {
      it("for a user", async () => {
        // TODO
      });

      it("for a company", async () => {
        // TODO
      });
    });

    describe("should return the sum added with stripe and manually added", () => {
      it("for a user", async () => {
        // TODO
      });

      it("for a company", async () => {
        // TODO
      });
    });

    describe("should deduct a funding issue", () => {
      it("for a user", async () => {
        const manualInvoiceBody: CreateManualInvoiceBody = {
          ...Fixture.createManualInvoiceBody(undefined, lonelyUserId),
          dowAmount: new Decimal(200),
        };
        await manualInvoiceRepo.create(manualInvoiceBody);

        const issueFundingBody1: CreateIssueFundingBody = {
          githubIssueId: validIssueId,
          userId: lonelyUserId,
          downAmount: new Decimal(50),
        };
        const issueFundingBody2: CreateIssueFundingBody = {
          ...issueFundingBody1,
          downAmount: new Decimal(20),
        };
        await issueFundingRepo.create(issueFundingBody1);
        await issueFundingRepo.create(issueFundingBody2);

        const totalDoWs = await dowNumberRepo.getAvailableDoWs(lonelyUserId);
        expect(totalDoWs).toEqual(new Decimal(200 - 50 - 20));
      });

      it("for a company", async () => {
        const manualInvoiceBody: CreateManualInvoiceBody = {
          ...Fixture.createManualInvoiceBody(validCompanyId),
          dowAmount: new Decimal(200),
        };
        await manualInvoiceRepo.create(manualInvoiceBody);

        const issueFundingBody1: CreateIssueFundingBody = {
          githubIssueId: validIssueId,
          userId: companyUserId2,
          downAmount: new Decimal(50),
        };
        const issueFundingBody2: CreateIssueFundingBody = {
          ...issueFundingBody1,
          downAmount: new Decimal(20),
        };
        await issueFundingRepo.create(issueFundingBody1);
        await issueFundingRepo.create(issueFundingBody2);

        const expected = new Decimal(200 - 50 - 20);
        const totalDoWs1 = await dowNumberRepo.getAvailableDoWs(
          companyUserId1,
          validCompanyId,
        );
        expect(totalDoWs1).toEqual(expected);
        const totalDoWs2 = await dowNumberRepo.getAvailableDoWs(
          companyUserId2,
          validCompanyId,
        );
        expect(totalDoWs2).toEqual(expected);
      });
    });

    // TODO: Add all the possible test cases for `getAvailableDoWs`:
  });
});
