"use strict";
// src/server.ts
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const PORT = parseInt(process.env.PORT || '3005', 10);
const HOST = '0.0.0.0';
const start = async () => {
    try {
        await app_1.app.listen({ port: PORT, host: HOST });
        app_1.app.log.info(`🚀 Ads service listening on http://${HOST}:${PORT}`);
    }
    catch (err) {
        app_1.app.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map