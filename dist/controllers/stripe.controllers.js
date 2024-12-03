"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const db_1 = require("../db/");
const http_status_codes_1 = require("http-status-codes");
const stripe_1 = __importDefault(require("stripe"));
const model_1 = require("../model");
const config_1 = require("../config");
// https://github.com/stripe-samples/subscriptions-with-card-and-direct-debit/blob/main/server/node/server.js
const userRepo = (0, db_1.getUserRepository)();
const stripe = new stripe_1.default(config_1.config.stripe.secretKey);
const stripeInvoiceRepo = (0, db_1.getStripeInvoiceRepository)();
const stripeCustomerRepo = (0, db_1.getStripeCustomerRepository)();
const addressRepo = (0, db_1.getAddressRepository)();
const stripeProductRepo = (0, db_1.getStripeProductRepository)();
class StripeController {
    static calculateTax(orderAmount, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const taxCalculation = yield stripe.tax.calculations.create({
                currency,
                customer_details: {
                    address: {
                        line1: "10709 Cleary Blvd",
                        city: "Plantation",
                        state: "FL",
                        postal_code: "33322",
                        country: "US",
                    },
                    address_source: "shipping",
                },
                line_items: [
                    {
                        amount: orderAmount,
                        reference: "ProductRef",
                        tax_behavior: "exclusive",
                        tax_code: "txcd_30011000",
                    },
                ],
            });
            return taxCalculation;
        });
    }
    static getDowPrices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield stripeProductRepo.getAll();
            // TODO: For the POC, we should have only one product of each type
            const subscriptionProducts = products.find((p) => p.recurring);
            const oneTimeProducts = products.find((p) => !p.recurring);
            if (!subscriptionProducts) {
                throw new Error("No subscription product found");
            }
            if (!oneTimeProducts) {
                throw new Error("No one-time product found");
            }
            const prices = yield stripe.prices.list({
                limit: 100,
            });
            // TODO: For the POC, we should have less than 100 prices
            if (prices.has_more) {
                config_1.logger.warn("More than 100 prices found");
            }
            const subscriptionPrices = prices.data.filter((price) => {
                return price.product === subscriptionProducts.stripeId.toString();
            });
            const oneTimePrices = prices.data.filter((price) => {
                return price.product === oneTimeProducts.stripeId.toString();
            });
            const response = {
                subscriptionPrices: subscriptionPrices,
                oneTimePrices: oneTimePrices,
            };
            res.send({ success: response });
        });
    }
    static createCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!req.user) {
                return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send();
            }
            else {
                const address = yield addressRepo.getCompanyUserAddress(req.user.id);
                let stripeAddress;
                if (address) {
                    stripeAddress = address;
                }
                else {
                    stripeAddress = {
                        country: req.body.countryCode,
                    };
                }
                const customer = yield stripe.customers.create({
                    description: req.user.id.toString(),
                    email: (_a = req.user.email()) !== null && _a !== void 0 ? _a : undefined,
                    address: stripeAddress,
                    tax: {
                        validate_location: "immediately",
                    },
                    expand: ["tax"],
                });
                if (((_b = customer.tax) === null || _b === void 0 ? void 0 : _b.automatic_tax) === "unrecognized_location") {
                    return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send();
                }
                else if (((_c = customer.tax) === null || _c === void 0 ? void 0 : _c.automatic_tax) === "failed") {
                    return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send();
                }
                else {
                    const stripeCustomer = new model_1.StripeCustomer(new model_1.StripeCustomerId(customer.id), req.user.id);
                    yield stripeCustomerRepo.insert(stripeCustomer);
                    // Create a SetupIntent to set up our payment methods recurring usage
                    const setupIntent = yield stripe.setupIntents.create({
                        payment_method_types: ["card"], // TODO: lolo
                        customer: customer.id,
                    });
                    return res.status(http_status_codes_1.StatusCodes.CREATED).send(stripeCustomer);
                }
            }
        });
    }
    static createSubscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = [];
            for (const item of req.body.priceItems) {
                items.push({ price: item.priceId.toString(), quantity: item.quantity });
            }
            // Create the subscription.
            // Note we're expanding the Subscription's latest invoice and that invoice's payment_intent so we can pass it to the front end to confirm the payment
            const subscription = yield stripe.subscriptions.create({
                customer: req.body.stripeCustomerId.toString(),
                items: items,
                payment_behavior: "default_incomplete",
                payment_settings: { save_default_payment_method: "on_subscription" },
                expand: ["latest_invoice.payment_intent"],
            });
            // At this point the Subscription is inactive and awaiting payment.
            res.send(subscription);
        });
    }
    static createPaymentIntent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Step 1: Create an invoice
            // Step 2: Create an invoice item
            // Step 3: Finalize the invoice and get the payment intent
            // Step 4: Request the payment intent for the invoice.
            const invoice = yield stripe.invoices.create({
                customer: req.body.stripeCustomerId.toString(),
                automatic_tax: {
                    enabled: true,
                },
            });
            for (const item of req.body.priceItems) {
                yield stripe.invoiceItems.create({
                    customer: req.body.stripeCustomerId.toString(),
                    invoice: invoice.id,
                    price: item.priceId.toString(),
                    quantity: item.quantity,
                    // tax_behavior: "exclusive",
                    // tax_rates: [taxCalculation.tax_rates[0].id],
                    // tax_code: "txcd_30011000",
                    // metadata: { tax_calculation: taxCalculation.id },
                });
            }
            const finalizedInvoice = yield stripe.invoices.finalizeInvoice(invoice.id);
            const paymentIntentId = finalizedInvoice.payment_intent;
            const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntentId);
            // Send publishable key and PaymentIntent client_secret to client.
            res.status(http_status_codes_1.StatusCodes.OK).send(paymentIntent);
        });
    }
    static webhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let event;
            try {
                event = stripe.webhooks.constructEvent(req.body, 
                // @ts-ignore
                req.headers["stripe-signature"], config_1.config.stripe.webhookSecret);
            }
            catch (err) {
                config_1.logger.error(`⚠️  Webhook signature verification failed.`, err);
                return res.sendStatus(http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
            const data = event.data;
            const eventType = event.type;
            // Handle the event
            // Review important events for Billing webhooks
            // https://stripe.com/docs/billing/webhooks
            // Remove comment to see the various objects sent for this sample
            // Event types: https://docs.stripe.com/api/events/types
            switch (eventType) {
                // https://docs.stripe.com/billing/subscriptions/webhooks#active-subscriptions
                case "invoice.paid":
                    const invoice = model_1.StripeInvoice.fromStripeApi(data.object);
                    if (invoice instanceof Error) {
                        throw invoice;
                    }
                    config_1.logger.debug(`🔔  Webhook received: ${eventType}!`);
                    yield stripeInvoiceRepo.insert(invoice);
                    break;
                case "payment_intent.succeeded":
                    // Cast the event into a PaymentIntent to make use of the types.
                    // const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent;
                    // Funds have been captured
                    // Fulfill any orders, e-mail receipts, etc
                    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds).
                    config_1.logger.debug(`🔔  Webhook received: ${data.object}!`);
                    config_1.logger.debug("💰 Payment captured!");
                    break;
                case "payment_intent.payment_failed":
                    // const paymentIntent = data as Stripe.PaymentIntent.DA;
                    config_1.logger.debug(`🔔  Webhook received: ${data.object}!`);
                    config_1.logger.debug("❌ Payment failed.");
                    break;
                default:
            }
            res.sendStatus(http_status_codes_1.StatusCodes.OK);
        });
    }
}
exports.StripeController = StripeController;
