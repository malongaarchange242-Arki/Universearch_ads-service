// src/server.ts

import 'dotenv/config';
import { app } from './app';

const PORT = parseInt(process.env.PORT || '3005', 10);
const HOST = '0.0.0.0';

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 Ads service listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();