import { config } from "../config";
import jwt from "jsonwebtoken";
import { ApiError } from "../model/error/ApiError";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

export interface TokenData {
  email?: string;
  userId?: string;
}

export class secureToken {
  /**
   *
   * @param data data email or userId
   *
   * @returns token and the expiration date
   */
  static generate(data: TokenData): [string, Date] {
    const expiresSecond = config.jwt.accessExpirationMinutes * 60;
    const expiresAt = new Date(Date.now() + expiresSecond * 1000);
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + expiresSecond,
        jti: uuidv4(),
        ...data,
      },
      config.jwt.secret,
    );
    return [token, expiresAt];
  }

  static async verify(token: string): Promise<TokenData> {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenData;
    } catch (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid token: ${err}`);
    }
  }
}
