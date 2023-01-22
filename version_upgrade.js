/*
 * Call this using node version_upgrade.js <version>
 * version should be formatted in semver version, either 0.0.1 or v0.0.1
 */
import packageJson from './package.json' assert { type: 'json' }
import * as fs from 'fs';

if (process.argv.length >= 2) {
    let version = process.argv[2];

    if (version.charAt(0) === 'v') {
        console.log('v detected')
        version = version.substring(1, version.length)
    }

    packageJson.version = version

    console.log('package.json modified:')
    console.log(packageJson)

    fs.writeFileSync('package.json', JSON.stringify(packageJson))
}
