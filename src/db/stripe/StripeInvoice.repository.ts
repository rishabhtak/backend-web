import { Pool } from "pg";
import {
  CompanyId,
  StripeInvoice,
  StripeInvoiceId,
  StripeInvoiceLine,
  UserId,
} from "../../model";
import { getPool } from "../../dbPool";
import {
  getStripeInvoiceLineRepository,
  StripeInvoiceLineRepository,
} from "./StripeInvoiceLine.repository";

export function getStripeInvoiceRepository(): StripeInvoiceRepository {
  return new StripeInvoiceRepositoryImpl(getPool());
}

export interface StripeInvoiceRepository {
  insert(invoice: StripeInvoice): Promise<StripeInvoice>;

  getById(id: StripeInvoiceId): Promise<StripeInvoice | null>;
}

class StripeInvoiceRepositoryImpl implements StripeInvoiceRepository {
  private pool: Pool;
  private stripeInvoiceLineRepository: StripeInvoiceLineRepository;

  constructor(pool: Pool) {
    this.pool = pool;
    this.stripeInvoiceLineRepository = getStripeInvoiceLineRepository();
  }

  private getOneInvoice(
    rows: any[],
    lines: StripeInvoiceLine[],
  ): StripeInvoice {
    const invoice = this.getOptionalInvoice(rows, lines);
    if (invoice === null) {
      throw new Error("Invoice not found");
    } else {
      return invoice;
    }
  }

  private getOptionalInvoice(
    rows: any[],
    lines: StripeInvoiceLine[],
  ): StripeInvoice | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple invoices found");
    } else {
      const invoice = StripeInvoice.fromBackend(rows[0], lines);
      if (invoice instanceof Error) {
        throw invoice;
      }
      return invoice;
    }
  }

  async getById(id: StripeInvoiceId): Promise<StripeInvoice | null> {
    const result = await this.pool.query(
      `
                SELECT stripe_id,
                       customer_id,
                       paid,
                       account_country,
                       currency,
                       total,
                       total_excl_tax,
                       subtotal,
                       subtotal_excl_tax,
                       hosted_invoice_url,
                       invoice_pdf
                FROM stripe_invoice
                WHERE stripe_id = $1
            `,
      [id.toString()],
    );

    const lines = await this.stripeInvoiceLineRepository.getByInvoiceId(id);

    const invoice = this.getOptionalInvoice(result.rows, lines);
    if (!invoice) {
      return null;
    }

    return invoice;
  }

  async insert(invoice: StripeInvoice): Promise<StripeInvoice> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
                    INSERT INTO stripe_invoice (stripe_id, customer_id, paid, account_country, currency, total,
                                                total_excl_tax, subtotal, subtotal_excl_tax, hosted_invoice_url,
                                                invoice_pdf)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING stripe_id, customer_id, paid, account_country, currency, total, total_excl_tax, subtotal, subtotal_excl_tax, hosted_invoice_url, invoice_pdf
                `,
        [
          invoice.id.toString(),
          invoice.customerId.toString(),
          invoice.paid,
          invoice.accountCountry,
          invoice.currency,
          invoice.total,
          invoice.totalExclTax,
          invoice.subtotal,
          invoice.subtotalExclTax,
          invoice.hostedInvoiceUrl,
          invoice.invoicePdf,
        ],
      );

      // Insert associated invoice lines
      for (const line of invoice.lines) {
        await client.query(
          `
                        INSERT INTO stripe_invoice_line (stripe_id, invoice_id, customer_id, product_id, price_id,
                                                         quantity)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `,
          [
            line.stripeId.toString(),
            line.invoiceId.toString(),
            line.customerId.toString(),
            line.productId.toString(),
            line.priceId.toString(),
            line.quantity,
          ],
        );
      }

      await client.query("COMMIT");

      return invoice; // TODO: Return the invoice created
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllInvoicePaidBy(id: CompanyId | UserId): Promise<any[]> {
    let result;

    if (id instanceof CompanyId) {
      result = await this.pool.query(
        `
                SELECT *
                FROM stripe_invoice
                WHERE customer_id IN (
                    SELECT stripe_id FROM stripe_customer WHERE user_id IN (
                        SELECT user_id FROM user_company WHERE company_id = $1
                    )
                ) AND paid = TRUE
                `,
        [id.toString()],
      );
    } else {
      result = await this.pool.query(
        `
                SELECT *
                FROM stripe_invoice
                WHERE customer_id IN (
                    SELECT stripe_id FROM stripe_customer WHERE user_id = $1
                ) AND paid = TRUE
                `,
        [id.toString()],
      );
    }

    return result.rows;
  }
}
