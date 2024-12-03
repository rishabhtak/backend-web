import { Pool } from "pg";
import { getPool } from "../../dbPool";
import { StripeProduct, StripeProductId } from "../../model";

export function getStripeProductRepository(): StripeProductRepository {
  return new StripeProductRepositoryImpl(getPool());
}

export interface StripeProductRepository {
  insert(product: StripeProduct): Promise<StripeProduct>;
  getById(id: StripeProductId): Promise<StripeProduct | null>;
  getAll(): Promise<StripeProduct[]>;
}

class StripeProductRepositoryImpl implements StripeProductRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneProduct(rows: any[]): StripeProduct {
    const product = this.getOptionalProduct(rows);
    if (product === null) {
      throw new Error("Product not found");
    } else {
      return product;
    }
  }

  private getOptionalProduct(rows: any[]): StripeProduct | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple products found");
    } else {
      const product = StripeProduct.fromBackend(rows[0]);
      if (product instanceof Error) {
        throw product;
      }
      return product;
    }
  }

  private getProductList(rows: any[]): StripeProduct[] {
    return rows.map((r) => {
      const product = StripeProduct.fromBackend(r);
      if (product instanceof Error) {
        throw product;
      }
      return product;
    });
  }

  async getAll(): Promise<StripeProduct[]> {
    const result = await this.pool.query(`
        SELECT *
        FROM stripe_product
    `);

    return this.getProductList(result.rows);
  }

  async getById(id: StripeProductId): Promise<StripeProduct | null> {
    const result = await this.pool.query(
      `
        SELECT *
        FROM stripe_product
        WHERE stripe_id = $1
      `,
      [id.toString()],
    );

    return this.getOptionalProduct(result.rows);
  }

  async insert(product: StripeProduct): Promise<StripeProduct> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
          INSERT INTO stripe_product (
              stripe_id, unit, unit_amount, recurring
          ) VALUES ($1, $2, $3, $4)
          RETURNING stripe_id, unit, unit_amount, recurring
        `,
        [
          product.stripeId.toString(),
          product.unit,
          product.unitAmount,
          product.recurring,
        ],
      );

      return this.getOneProduct(result.rows);
    } finally {
      client.release();
    }
  }
}
