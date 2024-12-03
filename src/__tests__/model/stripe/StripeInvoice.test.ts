import { StripeInvoice } from "../../../model";
import * as fs from "fs";
import { logger } from "../../../config";

describe("StripeInvoice", () => {
  it("fromStripeApi does not throw an error", () => {
    const data = fs.readFileSync(
      `src/__tests__/model/stripe/invoice.paid.json`,
      "utf8",
    );
    const json = JSON.parse(data);
    const invoice = StripeInvoice.fromStripeApi(json);

    if (invoice instanceof Error) {
      logger.error(invoice);
    }
    expect(invoice).toBeInstanceOf(StripeInvoice);
  });
});
