import { createApp } from "./createApp";
import { config, logger } from "./config";

const app = createApp();

app.listen(config.port, () => {
  logger.info(`Running on Port ${config.port}`);
});
