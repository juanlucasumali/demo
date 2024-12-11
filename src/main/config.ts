import { loadEnv } from './utils/loadEnv'

interface Config {
  B2_APPLICATION_KEY_ID: string
  B2_APPLICATION_KEY: string
  B2_BUCKET_ID: string
  B2_BUCKET_NAME: string
}

const env = loadEnv()

function validateConfig(config: Config) {
  const required = [
    'B2_APPLICATION_KEY_ID',
    'B2_APPLICATION_KEY',
    'B2_BUCKET_ID',
    'B2_BUCKET_NAME'
  ] as const;

  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export const config: Config = {
  B2_APPLICATION_KEY_ID: env.VITE_B2_APPLICATION_KEY_ID || '',
  B2_APPLICATION_KEY: env.VITE_B2_APPLICATION_KEY || '',
  B2_BUCKET_ID: env.VITE_B2_BUCKET_ID || '',
  B2_BUCKET_NAME: env.VITE_B2_BUCKET_NAME || ''
}

validateConfig(config)
