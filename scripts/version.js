const fs = require('fs')
const path = require('path')
const semver = require('semver')

const packageJsonPath = path.resolve(__dirname, '../package.json')
const pkg = require(packageJsonPath)

const bumpVersion = (type) => {
  const newVersion = semver.inc(pkg.version, type)
  pkg.version = newVersion
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log(`Version bumped to ${newVersion}`)
  return newVersion
}

const versionType = process.argv[2] || 'patch'
bumpVersion(versionType)
