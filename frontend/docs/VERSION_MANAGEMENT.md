# Version Management

This project uses automatic version bumping on each deployment.

## How It Works

### Automatic Version Bumping

When you push to the `main` branch, a GitHub Action automatically:
1. Bumps the patch version (e.g., `0.0.1` → `0.0.2`)
2. Updates `package.json`
3. Updates environment files (`environment.ts` and `environment.prod.ts`)
4. Commits the changes back to the repository
5. Vercel then builds with the new version

### Manual Version Bumping

You can manually bump the version using npm scripts:

```bash
# Bump patch version (0.0.1 → 0.0.2)
npm run version:bump

# Bump minor version (0.0.1 → 0.1.0)
npm run version:bump:minor

# Bump major version (0.0.1 → 1.0.0)
npm run version:bump:major
```

### Building with Version Bump

You can also build and bump version in one command:

```bash
# Build with patch version bump
npm run build:patch

# Build with minor version bump
npm run build:minor

# Build with major version bump
npm run build:major
```

## Version Format

The project uses [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Accessing Version in Code

The version is available in your Angular components via the environment:

```typescript
import { environment } from './config/environment';

console.log('App version:', environment.version);
```

## GitHub Action Details

The version bump workflow (`.github/workflows/version-bump.yml`):
- Runs on push to `main` branch
- Ignores markdown files and documentation changes
- Skips if commit message contains "chore: bump version" (prevents infinite loops)
- Automatically commits version changes back to the repo

## Notes

- Version is automatically bumped on each deployment to production
- Local builds do NOT bump the version (only GitHub Actions does)
- The version is included in both development and production environment files
- Version changes are committed with message: "chore: bump version [skip ci]"

