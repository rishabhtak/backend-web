import { StatusCodes } from "http-status-codes";

export function isAuth(req: any, res: any, next: any): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(StatusCodes.UNAUTHORIZED);
}
