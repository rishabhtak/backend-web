import { setupTestDB } from "../../__helpers__/jest.setup";
import { StripeCustomer, StripeInvoiceLine, UserId } from "../../../model";
import { Fixture } from "../../__helpers__/Fixture";
import {
  getCompanyRepository,
  getStripeCustomerRepository,
  getStripeInvoiceRepository,
  getStripeProductRepository,
  getUserRepository,
} from "../../../db";
import { StripePriceId } from "../../../model/stripe/StripePrice";

describe("StripeInvoiceRepository", () => {
  setupTestDB();

  let validUserId: UserId;

  beforeEach(async () => {
    const validUser = await userRepo.insert(
      Fixture.createUser(Fixture.localUser()),
    );
    validUserId = validUser.id;
  });

  const userRepo = getUserRepository();
  const companyRepo = getCompanyRepository();
  const customerRepo = getStripeCustomerRepository();
  const productRepo = getStripeProductRepository();
  const stripeInvoiceRepo = getStripeInvoiceRepository();

  describe("create", () => {
    it("should insert an invoice with lines", async () => {
      const customerId = Fixture.stripeCustomerId();
      const invoiceId = Fixture.stripeInvoiceId();
      const productId = Fixture.stripeProductId();

      const stripeId1 = Fixture.stripeInvoiceLineId();
      const stripeId2 = Fixture.stripeInvoiceLineId();

      // Insert user, company and customer before inserting the customer
      await userRepo.insert(Fixture.createUser(Fixture.localUser()));
      await companyRepo.create(Fixture.createCompanyBody());
      const customer = new StripeCustomer(customerId, validUserId);
      await customerRepo.insert(customer);
      await productRepo.insert(Fixture.stripeProduct(productId));

      const lines = [
        Fixture.stripeInvoiceLine(stripeId1, invoiceId, customerId, productId),
        Fixture.stripeInvoiceLine(stripeId2, invoiceId, customerId, productId),
      ];

      const invoice = Fixture.stripeInvoice(invoiceId, customerId, lines);
      const created = await stripeInvoiceRepo.insert(invoice);
      expect(created).toEqual(invoice);

      const found = await stripeInvoiceRepo.getById(invoiceId);
      expect(found).toEqual(invoice);
    });

    it("should rollback transaction if inserting lines fails", async () => {
      const customerId = Fixture.stripeCustomerId();
      const invoiceId = Fixture.stripeInvoiceId();
      const productId = Fixture.stripeProductId();

      const stripeId1 = Fixture.stripeInvoiceLineId();
      const stripeId2 = Fixture.stripeInvoiceLineId();

      // Insert user, company and customer before inserting the customer
      await userRepo.insert(Fixture.createUser(Fixture.localUser()));
      await companyRepo.create(Fixture.createCompanyBody());
      const customer = new StripeCustomer(customerId, validUserId);
      await customerRepo.insert(customer);
      await productRepo.insert(Fixture.stripeProduct(productId));

      const lines = [
        Fixture.stripeInvoiceLine(stripeId1, invoiceId, customerId, productId),
        // @ts-ignore
        new StripeInvoiceLine(
          stripeId2,
          invoiceId,
          customerId,
          productId,
          new StripePriceId("priceId"),
          -1, // This should cause an error
        ),
      ];

      const invoice = Fixture.stripeInvoice(invoiceId, customerId, lines);
      await expect(stripeInvoiceRepo.insert(invoice)).rejects.toThrow(Error);

      const found = await stripeInvoiceRepo.getById(invoiceId);
      expect(found).toBeNull();
    });
  });
});
