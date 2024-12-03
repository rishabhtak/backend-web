"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fixture = void 0;
const model_1 = require("../../model");
const StripePrice_1 = require("../../model/stripe/StripePrice");
const uuid_1 = require("uuid");
const decimal_js_1 = __importDefault(require("decimal.js"));
exports.Fixture = {
    id() {
        return Math.floor(Math.random() * 1000000);
    },
    uuid() {
        return (0, uuid_1.v4)();
    },
    userId() {
        const id = this.uuid();
        return new model_1.UserId(id);
    },
    localUser() {
        return new model_1.LocalUser("d@gmail.com" + this.uuid(), false, "password");
    },
    thirdPartyUser(id, provider = model_1.Provider.Github, email = "lauriane@gmail.com") {
        return new model_1.ThirdPartyUser(provider, new model_1.ThirdPartyUserId(id), email, new model_1.GithubData(exports.Fixture.owner(exports.Fixture.ownerId())));
    },
    createUser(data) {
        return {
            name: null,
            data: data,
            role: model_1.UserRole.USER,
        };
    },
    ownerId() {
        const id = this.id();
        return new model_1.OwnerId(`owner-${id.toString()}`, id);
    },
    owner(ownerId, payload = "payload") {
        return new model_1.Owner(ownerId, model_1.OwnerType.Organization, "url", payload);
    },
    repositoryId(ownerId) {
        const id = this.id();
        return new model_1.RepositoryId(ownerId, `repo-${id}`, id);
    },
    repository(repositoryId, payload = "payload") {
        return new model_1.Repository(repositoryId, "https://example.com", payload);
    },
    issueId(repositoryId) {
        const number = this.id();
        return new model_1.IssueId(repositoryId, number, number);
    },
    issue(issueId, openByOwnerId, payload = "payload") {
        return new model_1.Issue(issueId, "issue title", "url", new Date("2022-01-01T00:00:00.000Z"), null, openByOwnerId, payload);
    },
    addressId() {
        const uuid = this.uuid();
        return new model_1.AddressId(uuid);
    },
    createAddressBody() {
        return {
            name: "Valid Address",
            line1: "123 Test St",
            city: "Test City",
            state: "Test State",
            postalCode: "12345",
            country: "Test Country",
        };
    },
    address(addressId) {
        return new model_1.Address(addressId);
    },
    addressFromBody(addressId, dto) {
        return new model_1.Address(addressId, dto.name, dto.line1, dto.line2, dto.city, dto.state, dto.postalCode, dto.country);
    },
    companyId() {
        const uuid = this.uuid();
        return new model_1.CompanyId(uuid);
    },
    createCompanyBody(addressId) {
        return {
            name: "company",
            taxId: "taxId" + this.uuid(),
            addressId: addressId !== null && addressId !== void 0 ? addressId : null,
        };
    },
    company(companyId, addressId = null) {
        return new model_1.Company(companyId, null, "Company", addressId !== null ? addressId : null);
    },
    companyFromBody(companyId, dto) {
        var _a, _b, _c;
        return new model_1.Company(companyId, (_a = dto.taxId) !== null && _a !== void 0 ? _a : null, (_b = dto.name) !== null && _b !== void 0 ? _b : null, (_c = dto.addressId) !== null && _c !== void 0 ? _c : null);
    },
    stripeProductId() {
        const uuid = this.uuid();
        return new model_1.StripeProductId(uuid);
    },
    stripeProduct(productId) {
        return new model_1.StripeProduct(productId, "DoW", 1, false);
    },
    stripeCustomerId() {
        const uuid = this.uuid();
        return new model_1.StripeCustomerId(uuid);
    },
    stripePriceId() {
        const uuid = this.uuid();
        return new StripePrice_1.StripePriceId(uuid);
    },
    stripeInvoiceId() {
        const uuid = this.uuid();
        return new model_1.StripeInvoiceId(uuid);
    },
    stripeInvoice(invoiceId, customerId, lines) {
        return new model_1.StripeInvoice(invoiceId, customerId, true, "US", lines, "USD", 1000, 900, 800, 700, "https://hosted_invoice_url.com", "https://invoice_pdf.com");
    },
    stripeInvoiceLineId() {
        const uuid = this.uuid();
        return new model_1.StripeInvoiceLineId(uuid);
    },
    stripeInvoiceLine(stripeId, invoiceId, customerId, productId) {
        return new model_1.StripeInvoiceLine(stripeId, invoiceId, customerId, productId, new StripePrice_1.StripePriceId("100"), 100);
    },
    manualInvoiceId() {
        const uuid = this.uuid();
        return new model_1.ManualInvoiceId(uuid);
    },
    createManualInvoiceBody(companyId, userId, paid = true, dowAmount = 100.0) {
        return {
            number: 1,
            companyId: companyId,
            userId: userId,
            paid: paid,
            dowAmount: new decimal_js_1.default(dowAmount),
        };
    },
    manualInvoiceFromBody(id, dto) {
        return new model_1.ManualInvoice(id, dto.number, dto.companyId, dto.userId, dto.paid, dto.dowAmount);
    },
    issueFundingId() {
        const uuid = this.uuid();
        return new model_1.IssueFundingId(uuid);
    },
    issueFundingFromBody(issueFundingId, dto) {
        return new model_1.IssueFunding(issueFundingId, dto.githubIssueId, dto.userId, dto.downAmount);
    },
    managedIssueId() {
        const uuid = this.uuid();
        return new model_1.ManagedIssueId(uuid);
    },
    createManagedIssueBody(githubIssueId, managerId, requestedDowAmount = 5000) {
        return {
            githubIssueId,
            requestedDowAmount: new decimal_js_1.default(requestedDowAmount),
            managerId,
            contributorVisibility: model_1.ContributorVisibility.PUBLIC,
            state: model_1.ManagedIssueState.OPEN,
        };
    },
    managedIssueFromBody(managedIssueId, dto) {
        return new model_1.ManagedIssue(managedIssueId, dto.githubIssueId, dto.requestedDowAmount, dto.managerId, dto.contributorVisibility, dto.state);
    },
    createUserCompanyPermissionTokenBody(userEmail, companyId, expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)) {
        return {
            userName: "lauriane",
            userEmail,
            token: `token-${Math.floor(Math.random() * 1000000)}`,
            companyId,
            companyUserRole: model_1.CompanyUserRole.READ,
            expiresAt,
        };
    },
    userCompanyPermissionTokenFromBody(tokenId, dto) {
        return new model_1.CompanyUserPermissionToken(tokenId, dto.userName, dto.userEmail, dto.token, dto.companyId, dto.companyUserRole, dto.expiresAt);
    },
    createRepositoryUserPermissionTokenBody(repositoryId, userGithubOwnerLogin = `lauriane ${exports.Fixture.uuid()}`, expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)) {
        return {
            userName: "lauriane",
            userEmail: "lauriane@gmail.com",
            userGithubOwnerLogin,
            token: `token-${Math.floor(Math.random() * 1000000)}`,
            repositoryId,
            repositoryUserRole: model_1.RepositoryUserRole.READ,
            dowRate: new decimal_js_1.default(1.0),
            dowCurrency: model_1.DowCurrency.USD,
            expiresAt,
        };
    },
    repositoryUserPermissionTokenFromBody(tokenId, dto) {
        return new model_1.RepositoryUserPermissionToken(tokenId, dto.userName, dto.userEmail, dto.userGithubOwnerLogin, dto.token, dto.repositoryId, dto.repositoryUserRole, dto.dowRate, dto.dowCurrency, dto.expiresAt);
    },
    userRepository(userId, repositoryId, repositoryUserRole = model_1.RepositoryUserRole.READ, dowRate = 1.0, dowCurrency = "USD") {
        return new model_1.UserRepository(userId, repositoryId, repositoryUserRole, new decimal_js_1.default(dowRate), dowCurrency);
    },
};
