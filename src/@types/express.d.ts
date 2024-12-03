import {
  CompanyUserPermissionToken,
  RepositoryUserPermissionToken,
} from "../model";

declare global {
  namespace Express {
    interface Request {
      companyUserPermissionToken?: CompanyUserPermissionToken;
      repositoryUserPermissionToken?: RepositoryUserPermissionToken;
    }
  }
}
