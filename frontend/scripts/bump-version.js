#!/usr/bin/env node

/**
 * Automatically bumps the patch version in package.json
 * Usage: node scripts/bump-version.js [patch|minor|major]
 * Default: patch
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const versionType = process.argv[2] || 'patch';
const currentVersion = packageJson.version;

// Parse version
const versionParts = currentVersion.split('.').map(Number);
let [major, minor, patch] = versionParts;

// Bump version based on type
switch (versionType) {
  case 'major':
    major++;
    minor = 0;
    patch = 0;
    break;
  case 'minor':
    minor++;
    patch = 0;
    break;
  case 'patch':
  default:
    patch++;
    break;
}

const newVersion = `${major}.${minor}.${patch}`;

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ Version bumped: ${currentVersion} → ${newVersion} (${versionType})`);

// Also update environment files if they have version info
const envFiles = [
  path.join(__dirname, '..', 'src', 'app', 'config', 'environment.ts'),
  path.join(__dirname, '..', 'src', 'app', 'config', 'environment.prod.ts')
];

envFiles.forEach(envPath => {
  if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');
    // Update version if it exists, or add it if it doesn't
    if (content.includes("version:")) {
      content = content.replace(/version:\s*['"][^'"]*['"]/g, `version: '${newVersion}'`);
    } else {
      // Add version after production flag
      content = content.replace(/(production:\s*(?:true|false),)/, `$1\n  version: '${newVersion}',`);
    }
    fs.writeFileSync(envPath, content);
  }
});

process.exit(0);

