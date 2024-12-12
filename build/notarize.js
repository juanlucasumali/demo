import { notarize } from '@electron/notarize'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

export default async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appBundleId = context.packager.config.appId

  console.log(`Notarizing ${appBundleId} found at ${appOutDir}/${appName}.app`)
  console.log('Environment check:')
  console.log('APPLE_ID:', process.env.APPLE_ID ? '✓' : '✗')
  console.log('APPLE_TEAM_ID:', process.env.APPLE_TEAM_ID ? '✓' : '✗')
  console.log('APPLE_APP_SPECIFIC_PASSWORD:', process.env.APPLE_APP_SPECIFIC_PASSWORD ? '✓' : '✗')

  try {
    await notarize({
      tool: 'notarytool',
      appBundleId: appBundleId,
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    })
    console.log('Notarization completed successfully')
  } catch (error) {
    console.error('Notarization failed:', error)
    throw error
  }
}
