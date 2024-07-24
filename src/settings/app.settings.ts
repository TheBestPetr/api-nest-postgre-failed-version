import { config } from 'dotenv';
import * as process from 'process';

config();

export const SETTINGS = {
  PORT: process.env.APP_PORT || '',
  MONGO_URL: process.env.MONGO_URL || '',
};
