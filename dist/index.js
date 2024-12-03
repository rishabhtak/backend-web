"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createApp_1 = require("./createApp");
const config_1 = require("./config");
const app = (0, createApp_1.createApp)();
app.listen(config_1.config.port, () => {
    config_1.logger.info(`Running on Port ${config_1.config.port}`);
});
