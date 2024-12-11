import * as dotenv from 'dotenv'
import { join } from 'path'

export function loadEnv() {
  // Load .env file from project root
  const envPath = join(process.cwd(), '.env')
  
  // Load environment variables from .env file
  const result = dotenv.config({ path: envPath })
  
  if (result.error) {
    console.warn('Error loading .env file:', result.error)
  }

  return {
    ...process.env,
    ...result.parsed
  }
}
