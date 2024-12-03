import {
  getStripeCustomerRepository,
  getStripeInvoiceLineRepository,
  getStripeInvoiceRepository,
  getStripeProductRepository,
  getUserRepository,
} from "../../../db";
import { setupTestDB } from "../../__helpers__/jest.setup";
import { Fixture } from "../../__helpers__/Fixture";
import { StripeCustomer, StripeInvoiceLineId, UserId } from "../../../model";

describe("StripeInvoiceLineRepository", () => {
  setupTestDB();

  const userRepo = getUserRepository();
  const productRepo = getStripeProductRepository();
  const invoiceLineRepo = getStripeInvoiceLineRepository();
  const invoiceRepo = getStripeInvoiceRepository();
  const customerRepo = getStripeCustomerRepository();

  let validUserId: UserId;

  beforeEach(async () => {
    const validUser = await userRepo.insert(
      Fixture.createUser(Fixture.localUser()),
    );
    validUserId = validUser.id;
  });

  describe("create", () => {
    it("should work", async () => {
      const customerId = Fixture.stripeCustomerId();
      const invoiceId = Fixture.stripeInvoiceId();
      const productId = Fixture.stripeProductId();

      await userRepo.insert(Fixture.createUser(Fixture.localUser()));
      await customerRepo.insert(new StripeCustomer(customerId, validUserId));

      await productRepo.insert(Fixture.stripeProduct(productId));
      await invoiceRepo.insert(
        Fixture.stripeInvoice(invoiceId, customerId, []),
      );

      const invoiceLineId = Fixture.stripeInvoiceLineId();
      const invoiceLine = Fixture.stripeInvoiceLine(
        invoiceLineId,
        invoiceId,
        customerId,
        productId,
      );
      const created = await invoiceLineRepo.insert(invoiceLine);
      expect(created).toEqual(invoiceLine);

      const found = await invoiceLineRepo.getById(invoiceLine.stripeId);
      expect(found).toEqual(invoiceLine);
      expect(true).toEqual(true);
    });

    it("should fail with foreign key constraint error if invoice or customer is not inserted", async () => {
      const customerId = Fixture.stripeCustomerId();
      const invoiceId = Fixture.stripeInvoiceId();
      const productId = Fixture.stripeProductId();

      await userRepo.insert(Fixture.createUser(Fixture.localUser()));
      await customerRepo.insert(new StripeCustomer(customerId, validUserId));
      await productRepo.insert(Fixture.stripeProduct(productId));

      const invoiceLineId = Fixture.stripeInvoiceLineId();
      const invoiceLine = Fixture.stripeInvoiceLine(
        invoiceLineId,
        invoiceId,
        customerId,
        productId,
      );

      try {
        await invoiceLineRepo.insert(invoiceLine);
        // If the insertion doesn't throw, fail the test
        fail(
          "Expected foreign key constraint violation, but no error was thrown.",
        );
      } catch (error: any) {
        // Check if the error is related to foreign key constraint
        expect(error.message).toMatch(/violates foreign key constraint/);
      }
    });
  });

  describe("getById", () => {
    it("should return null if invoice line not found", async () => {
      const nonExistentInvoiceLineId = new StripeInvoiceLineId(
        "non-existent-id",
      );
      const found = await invoiceLineRepo.getById(nonExistentInvoiceLineId);

      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all invoice lines", async () => {
      const customerId = Fixture.stripeCustomerId();
      const invoiceId = Fixture.stripeInvoiceId();
      const productId = Fixture.stripeProductId();

      await userRepo.insert(Fixture.createUser(Fixture.localUser()));
      await customerRepo.insert(new StripeCustomer(customerId, validUserId));
      await productRepo.insert(Fixture.stripeProduct(productId));
      await invoiceRepo.insert(
        Fixture.stripeInvoice(invoiceId, customerId, []),
      );

      const invoiceLineId1 = Fixture.stripeInvoiceLineId();
      const invoiceLineId2 = Fixture.stripeInvoiceLineId();
      const invoiceLine1 = Fixture.stripeInvoiceLine(
        invoiceLineId1,
        invoiceId,
        customerId,
        productId,
      );
      const invoiceLine2 = Fixture.stripeInvoiceLine(
        invoiceLineId2,
        invoiceId,
        customerId,
        productId,
      );

      await invoiceLineRepo.insert(invoiceLine1);
      await invoiceLineRepo.insert(invoiceLine2);

      const allInvoiceLines = await invoiceLineRepo.getAll();

      expect(allInvoiceLines).toHaveLength(2);
      expect(allInvoiceLines).toContainEqual(invoiceLine1);
      expect(allInvoiceLines).toContainEqual(invoiceLine2);
    });

    it("should return an empty array if no invoice lines exist", async () => {
      const allInvoiceLines = await invoiceLineRepo.getAll();
      expect(allInvoiceLines).toEqual([]);
    });
  });
});
