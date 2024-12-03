import { Issue, IssueId, Owner, Repository, RepositoryId } from "../model";
import { config, logger } from "../config";
import { ValidationError } from "../model/error";

export function getGitHubAPI(): GitHubApi {
  return new GitHubApiImpl();
}

export interface GitHubApi {
  // returns the issue and the owner that opened the issue
  getIssue(issueId: IssueId): Promise<[Issue, Owner]>;

  getOwnerAndRepository(
    repositoryId: RepositoryId,
  ): Promise<[Owner, Repository]>;
}

class GitHubApiImpl implements GitHubApi {
  async getIssue(issueId: IssueId): Promise<[Issue, Owner]> {
    try {
      const response: Response = await fetch(
        `https://api.github.com/repos/${issueId.repositoryId.ownerId.login.trim()}/${issueId.repositoryId.name.trim()}/issues/${issueId.number}`,
        {
          method: "GET",
          headers: {
            Authorization: "Token " + config.github.requestToken,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      if (response.ok) {
        const json = await response.json();
        const issue: Issue | ValidationError = Issue.fromGithubApi(
          issueId.repositoryId,
          json,
        );
        const openBy: Owner | ValidationError = Owner.fromGithubApi(json.user);
        if (issue instanceof ValidationError) {
          logger.error(
            `Invalid JSON response: Issue parsing failed. URL: ${response.url}`,
          );
          return Promise.reject(issue);
        } else if (openBy instanceof ValidationError) {
          logger.error(
            `Invalid JSON response: Owner parsing failed. URL: ${response.url}`,
          );
          return Promise.reject(openBy);
        } else {
          return [issue, openBy];
        }
      } else {
        const errorDetails = `Error fetching issue: Status ${response.status} - ${response.statusText}. URL: ${response.url}`;
        logger.error(errorDetails);
        return Promise.reject(
          new Error(
            `Failed to fetch issue from GitHub. Status: ${response.status} - ${response.statusText}`,
          ),
        );
      }
    } catch (error) {
      logger.error(`Failed to call GitHub API for getIssue: ${error}`);
      return Promise.reject(new Error("Call to GitHub API failed: " + error));
    }
  }

  async getOwnerAndRepository(
    repositoryId: RepositoryId,
  ): Promise<[Owner, Repository]> {
    try {
      const response: Response = await fetch(
        `https://api.github.com/repos/${repositoryId.ownerId.login.trim()}/${repositoryId.name.trim()}`,
        {
          method: "GET",
          headers: {
            Authorization: "Token " + config.github.requestToken,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      if (response.ok) {
        const json = await response.json();
        if (!json.owner) {
          return Promise.reject(
            new Error(
              `Invalid JSON response: Missing owner field. URL: ${response.url}`,
            ),
          );
        }

        const owner: Owner | ValidationError = Owner.fromGithubApi(json.owner);
        const repo: Repository | ValidationError =
          Repository.fromGithubApi(json);
        if (repo instanceof ValidationError) {
          logger.error(
            `Invalid JSON response: Repository parsing failed. URL: ${response.url}`,
          );
          return Promise.reject(repo);
        } else if (owner instanceof ValidationError) {
          logger.error(
            `Invalid JSON response: Owner parsing failed. URL: ${response.url}`,
          );
          return Promise.reject(owner);
        } else {
          return [owner, repo];
        }
      } else {
        return Promise.reject(
          new Error(
            `Failed to fetch repository from GitHub. Status: ${response.status} - ${response.statusText}. URL: ${response.url}`,
          ),
        );
      }
    } catch (error) {
      logger.error(
        `Failed to call GitHub API for getOwnerAndRepository: ${error}`,
      );
      return Promise.reject(new Error("Call to GitHub API failed: " + error));
    }
  }
}
