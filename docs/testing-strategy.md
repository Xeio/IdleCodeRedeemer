# Testing Strategy & Automated Test Suites

This document describes how automated tests are run in this project's CI/CD pipelines before any code is merged into the primary branch. [OSPS-QA-06.01]

## Overview

All commits to the primary branch must be validated through automated test suites running in CI/CD pipelines. These tests verify that changes meet functional and quality expectations.

**Key Principles:**
- ✅ Tests run on every pull request and commit to main
- ✅ Results are visible to all contributors
- ✅ Tests run in consistent Docker environment
- ✅ Contributors can run tests locally before submission
- ✅ Failing tests block pull request merge

## Test Suites

### 1. Build & Compilation Tests

**Purpose**: Verify code compiles to valid JavaScript with no TypeScript errors

**Type**: Automated compile-time validation

**Command (Local)**:
```bash
mise run build
```

**CI/CD Trigger**: Runs as part of docker.yml workflow on every push and PR

**What It Checks**:
- ✅ TypeScript strict mode compilation passes
- ✅ No type errors or type safety issues
- ✅ Valid JavaScript output generated
- ✅ Source maps created for debugging

**Pass Criteria**: Compilation succeeds with no errors

**Fail Action**: Docker build fails with error details shown

### 2. Code Quality & Linting Tests

**Purpose**: Verify code follows project standards and best practices

**Type**: Automated linting with ESLint

**Command (Local)**:
```bash
mise run lint
```

**Command (Fix Issues)**:
```bash
mise run lint:fix
```

**CI/CD Trigger**: Runs via pre-commit hooks and GitHub Actions on every push/PR

**What It Checks**:
- ✅ No undefined variables or unused imports
- ✅ Proper error handling (try/catch on promises)
- ✅ Code style consistency (naming conventions, formatting)
- ✅ Security issues (no eval, no console in production code)
- ✅ Best practices (async/await patterns, proper typing)

**Pass Criteria**: ESLint reports zero errors

**Fail Action**: Pull request status check shows lint errors, blocks merge

### 3. Security Vulnerability Scanning

**Purpose**: Detect security vulnerabilities in code and dependencies

**Type**: Automated CodeQL analysis + Dependency scanning

**Commands (Local)**:
```bash
# Check for vulnerable dependencies
bun audit

# Check outdated dependencies
bun outdated
```

**CI/CD Triggers**:
- **CodeQL**: Runs on every PR and push to main (codeql.yml)
- **Dependency Review**: Runs when package.json changes (dependency-review.yml)
- **Secret Scanning**: Runs on every push and PR (secrets.yml)

**What It Checks**:
- ✅ No SQL injection vulnerabilities
- ✅ No hardcoded credentials
- ✅ No unsafe crypto usage
- ✅ No dependency vulnerabilities (CVEs)
- ✅ No secrets (API keys, tokens) in code

**Pass Criteria**: No high/critical severity issues found

**Fail Action**: PR status check shows vulnerabilities, blocks merge

### 4. Type Safety Validation

**Purpose**: Ensure TypeScript strict mode compliance

**Type**: TypeScript compiler with strict mode

**Configuration**: `tsconfig.bot.json` with `strict: true`

**Command (Local)**:
```bash
tsc -p tsconfig.bot.json --noEmit
```

**CI/CD Trigger**: Runs as part of docker.yml build process

**What It Checks**:
- ✅ All variables have explicit types
- ✅ No implicit `any` types
- ✅ Function parameters and returns are typed
- ✅ Null/undefined safety checks
- ✅ Interface compliance for objects

**Pass Criteria**: TypeScript compilation succeeds with strict mode

**Fail Action**: Build fails with type errors

### 5. Formatting & Code Style Tests

**Purpose**: Ensure consistent code formatting across the project

**Type**: Prettier code formatter

**Command (Local)**:
```bash
mise run format
```

**Command (Check Only)**:
```bash
mise run format:check
```

**CI/CD Trigger**: Pre-commit hooks enforce formatting on every commit

**What It Checks**:
- ✅ Consistent indentation (2 spaces)
- ✅ Line length (80 chars in some files)
- ✅ Consistent quote style (single quotes in TS)
- ✅ Proper semicolon usage
- ✅ Consistent spacing around operators

**Pass Criteria**: All files match Prettier format

**Fail Action**: Commit rejected by pre-commit hook until formatted

### 6. Unit Tests

**Purpose**: Verify individual modules behave correctly in isolation

**Type**: Automated unit tests using the built-in Bun test runner

**Command (Local)**:
```bash
bun test
```

**Watch Mode (Local)**:
```bash
bun test --watch
```

**What It Tests**:

| File | Tests | Coverage |
|------|-------|----------|
| `src/bot/handlers/codeScanner.test.ts` | 12 | `extractCodesFromText` — regex patterns, emoji stripping, case normalisation, edge cases |
| `src/bot/database/codeManager.test.ts` | 32 | All `CodeManager` methods — per-user redemption, public/private codes, pending codes, expiry |
| `src/bot/database/userManager.test.ts` | 13 | All `UserManager` CRUD operations |

**Total**: 57 tests across 3 files

**Test Infrastructure**:

- `bunfig.toml` registers a preload file: `src/test/setup.ts`
- `src/test/setup.ts` sets `DB_PATH=:memory:` and `MIGRATIONS_PATH` **before any module imports**
- Tests use plain static imports — `db.ts` automatically opens an in-memory SQLite database
- `initializeDatabase()` is called in `beforeAll` to apply migrations
- Tables are cleared in FK-safe order in `beforeEach` (children before parents)
- `closeDatabase()` is **never** called in tests — Bun reuses workers between test files

**Pass Criteria**: All 57 tests pass with zero failures

**Fail Action**: Test run exits with a non-zero code and shows failed assertion details

## Running Tests Locally

### Before Submitting a Pull Request

Run these commands to catch issues locally:

```bash
# 1. Install dependencies
mise run install

# 2. Compile TypeScript
mise run build

# 3. Run unit tests
bun test

# 4. Run linting and fix auto-fixable issues
mise run lint:fix

# 5. Run code formatting
mise run format

# 6. Check for security vulnerabilities
bun audit

# 7. Sign off on your commits
git commit -s -m "message"
```

**This prevents CI/CD failures and keeps PR review smooth.**

### Quick Check Script

Create a local script to run all checks:

```bash
#!/bin/bash
# File: scripts/test-locally.sh

echo "🧪 Running local tests..."

echo "📦 Building project..."
mise run build || exit 1

echo "✅ Linting code..."
mise run lint || exit 1

echo "🎨 Checking formatting..."
mise run format:check || exit 1

echo "🔐 Checking for vulnerabilities..."
bun audit || exit 1

echo "✅ All local tests passed!"
```

Run with:
```bash
chmod +x scripts/test-locally.sh
./scripts/test-locally.sh
```

## CI/CD Testing Pipeline

### Pull Request Testing Flow

When you open a pull request:

```
1. Create PR
   ↓
2. GitHub Actions triggered:
   - DCO Sign-Off Check (.github/workflows/dco-check.yml)
   - Docker Build & Compile (docker.yml)
   - CodeQL Security Scan (codeql.yml)
   - Dependency Review (dependency-review.yml)
   - Secret Scanning (secrets.yml)
   ↓
3. All checks run in parallel
   ↓
4. Results appear in PR status:
   ✅ Build successful
   ✅ Lint passes
   ✅ No security issues
   ✅ DCO signed off
   ✓ CodeQL passed
   ✓ Dependencies safe
   ✓ No secrets detected
   ↓
5. All pass? PR is ready for code review
   Any fail? Fix and push new commits to re-test
```

### Status Checks Required to Pass

| Check | Workflow | Type | Blocking |
|-------|----------|------|----------|
| DCO Sign-Off | dco-check.yml | Legal | ✅ Yes |
| Compilation | docker.yml | Build | ✅ Yes |
| Linting | docker.yml | Quality | ✅ Yes |
| CodeQL Security | codeql.yml | Security | ✅ Yes |
| Dependencies | dependency-review.yml | Security | ✅ Yes |
| Secrets | secrets.yml | Security | ✅ Yes |

### Test Environment

All CI/CD tests run in a consistent Docker environment:

**Base Image**: `node:24-slim`
**Package Manager**: Bun
**Node.js Version**: 24 (latest LTS)
**Environment**: Ubuntu 24.04

**Installed Tools**:
- bun (package manager)
- node (runtime)
- TypeScript (compiler)
- ESLint (linter)
- Prettier (formatter)
- Cosign (code signing)
- Gitleaks (secret scanning)

## Test Results & Visibility

### For Contributors

Test results are visible:
- ✅ In the pull request status checks section
- ✅ In GitHub Actions tab (detailed logs)
- ✅ In individual workflow runs
- ✅ In commit status (if pushed directly)

**Example PR Status**:
```
✅ Build (Docker build & compile) — Passed 15 mins ago
✅ CodeQL (codeql-analysis) — Passed 14 mins ago
✅ Dependencies (dependency-review) — Passed 13 mins ago
✅ Secrets (secret-scanning) — Passed 13 mins ago
✅ DCO (dco-check) — Passed 13 mins ago
```

### Detailed Logs

Click "Details" on any failed check to see:
- ✅ Exact error messages
- ✅ File and line numbers
- ✅ Recommended fixes
- ✅ Full workflow logs

**Example Error**:
```
❌ Build failed

Error: ESLint error in src/commands/inventory.ts:45
  45:5  error  'userId' is assigned a value but never used  no-unused-vars

Fix: Remove unused variable or use in code
```

## Testing Best Practices

### For All Contributors

1. **Run Tests Before Submitting PR**
   ```bash
   ./scripts/test-locally.sh
   ```
   This catches issues early and speeds up PR review.

2. **Review Test Failures Carefully**
   - Read the error message completely
   - Click "Details" for full logs
   - Fix the underlying issue (don't bypass)
   - Don't commit if tests fail locally

3. **Update Tests When Changing Code**
   - If you change a function's behavior, update tests
   - If you add a new feature, add tests
   - New code should have 80%+ test coverage

4. **Keep Tests Isolated**
   - Each test should be independent
   - Tests shouldn't depend on execution order
   - Mock external dependencies (APIs, databases)

### For Maintainers

1. **Review Test Coverage**
   - Check that new code has adequate tests
   - Look for edge cases in test suite
   - Ensure error scenarios are tested

2. **Maintain Test Quality**
   - Keep tests simple and readable
   - Remove flaky/unreliable tests
   - Update tests when behavior changes

3. **Monitor Test Trends**
   - Track build/test failures over time
   - Identify patterns in failures
   - Address recurring issues

## Troubleshooting Failed Tests

### Build Fails

**Error**: `error TS2307: Cannot find module '@types/...'`

**Fix**:
```bash
bun install
mise run build
```

**Cause**: Missing type definitions or stale lockfile

---

### Lint Fails

**Error**: `error  'userId' is assigned a value but never used  no-unused-vars`

**Fix**:
```bash
# Option 1: Remove unused variable
# Delete the line: const userId = ...

# Option 2: Use the variable
// Use userId in code

# Run autofix
mise run lint:fix
```

---

### Security Vulnerabilities

**Error**: `CodeQL: SQL Injection vulnerability in query`

**Fix**:
1. Review the vulnerable code in GitHub Security tab
2. Use parameterized queries:
   ```typescript
   // ❌ Vulnerable
   db.exec(`SELECT * FROM users WHERE id = '${userId}'`);
   
   // ✅ Safe
   db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
   ```
3. Push fix and test will re-run

---

### Dependency Vulnerabilities

**Error**: `npm audit: High severity vulnerability in dependency@1.0.0`

**Fix**:
```bash
# Update to patched version
bun add dependency@latest

# Or update all
bun update

# Verify no new vulnerabilities
bun audit

# Commit
git commit -m "chore: update dependencies for security"
```

---

### Secret Detected

**Error**: `Secret scanning found: GitHub token in code`

**Fix**:
```bash
# Remove the secret from code
# Put it in .env file instead

# .env (not in git)
GITHUB_TOKEN=ghp_...

# code file
const token = process.env.GITHUB_TOKEN;

# Verify Gitleaks passes
mise run gitleaks
```

## OSPS-QA-06.01 Compliance

| Requirement | Status | Evidence |
|---|---|---|
| **Automated test suite configured** | ✅ | 6 test suites documented, 6 CI/CD workflows + 57 unit tests |
| **Tests run before every merge** | ✅ | Branch protection requires checks pass |
| **Results visible to contributors** | ✅ | GitHub Actions logs, PR status checks |
| **Consistent environment** | ✅ | Docker container with standardized tools |
| **Local testing available** | ✅ | Test commands documented, scripts provided |
| **Multiple test types** | ✅ | Build, linting, security, type checking, formatting, unit tests |
| **Documented** | ✅ | This file (testing-strategy.md) and CONTRIBUTING.md |

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [ESLint Configuration](https://eslint.org/docs/latest/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/options.html)
- [Bun Testing](https://bun.sh/docs)
- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)

---

**Note**: Automated tests are essential to project quality. All contributors are expected to run tests locally before submitting pull requests.
