import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
};