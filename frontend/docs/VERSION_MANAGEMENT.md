# Version Management

This project uses automatic version bumping on each deployment.

## How It Works

### Automatic Version Bumping

When you push to the `main` branch, a GitHub Action automatically detects the version bump type based on your commit messages:

1. **MAJOR** bump if commit contains: `breaking`, `major`, `!`, or `BREAKING`
   - Example: `feat!: remove deprecated API` → `1.0.0` → `2.0.0`

2. **MINOR** bump if commit starts with: `feat`, `feature`, or `add`
   - Example: `feat: add healthcare module` → `1.0.0` → `1.1.0`

3. **PATCH** bump for everything else (default)
   - Example: `fix: login timeout issue` → `1.0.0` → `1.0.1`

The workflow then:
1. Bumps the appropriate version number
2. Updates `package.json`
3. Updates environment files (`environment.ts` and `environment.prod.ts`)
4. Commits the changes back to the repository
5. Vercel then builds with the new version

#### Commit Message Examples

```bash
# Major version (breaking change)
git commit -m "feat!: remove old authentication system"
git commit -m "BREAKING: change database schema"
git commit -m "refactor!: remove deprecated API endpoints"

# Minor version (new feature)
git commit -m "feat: add new dashboard widgets"
git commit -m "feature: implement healthcare module"
git commit -m "add: new reporting functionality"

# Patch version (bug fix or other)
git commit -m "fix: login timeout issue"
git commit -m "fix: calculation error in budgets"
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
```

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

The project uses [Semantic Versioning](https://semver.org/) (SemVer):
- **MAJOR** (X.0.0): Breaking changes that are NOT backward compatible
- **MINOR** (0.X.0): New features that ARE backward compatible
- **PATCH** (0.0.X): Bug fixes that ARE backward compatible

### When to Increment Each Version

#### MAJOR Version (Breaking Changes)
Increment when you make changes that break backward compatibility:
- **Removing** features, APIs, or functionality
- **Changing** existing API signatures or behavior in incompatible ways
- **Removing** or renaming database columns/tables (if users have data)
- **Changing** authentication methods that break existing sessions
- **Removing** configuration options
- **Changing** data formats that existing data can't use
- **Breaking** changes to environment variables or configuration

**Examples:**
- `1.5.3` → `2.0.0`: Removed deprecated API endpoint
- `2.1.0` → `3.0.0`: Changed authentication from JWT to OAuth (breaking change)
- `1.0.0` → `2.0.0`: Removed support for old database schema

#### MINOR Version (New Features)
Increment when you add new functionality that remains backward compatible:
- **Adding** new features or modules
- **Adding** new API endpoints
- **Adding** new configuration options (without removing old ones)
- **Adding** new database tables/columns (without removing old ones)
- **Enhancing** existing features without breaking them
- **Adding** new UI components or pages

**Examples:**
- `1.5.3` → `1.6.0`: Added new healthcare module
- `2.1.0` → `2.2.0`: Added new dashboard widgets
- `1.0.0` → `1.1.0`: Added new API endpoint for reports

#### PATCH Version (Bug Fixes)
Increment for bug fixes and small improvements:
- **Fixing** bugs
- **Fixing** security vulnerabilities
- **Improving** performance (without changing behavior)
- **Fixing** typos or documentation
- **Refactoring** code (without changing functionality)
- **Updating** dependencies (without breaking changes)

**Examples:**
- `1.5.3` → `1.5.4`: Fixed login timeout issue
- `2.1.0` → `2.1.1`: Fixed calculation error in budget module
- `1.0.0` → `1.0.1`: Fixed typo in error message

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
- **Automatically detects version bump type** from commit messages:
  - Looks for breaking change keywords → MAJOR
  - Looks for feature keywords → MINOR
  - Defaults to PATCH for everything else
- Automatically commits version changes back to the repo

### Conventional Commits Support

The workflow follows [Conventional Commits](https://www.conventionalcommits.org/) patterns:
- `feat!:` or `BREAKING:` → Major version
- `feat:` or `feature:` → Minor version
- `fix:`, `docs:`, `chore:`, etc. → Patch version

## Notes

- Version is automatically bumped on each deployment to production
- Local builds do NOT bump the version (only GitHub Actions does)
- The version is included in both development and production environment files
- Version changes are committed with message: "chore: bump version [skip ci]"

