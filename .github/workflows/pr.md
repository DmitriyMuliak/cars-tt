# PR Workflow — Detailed Documentation

This document describes every step in `.github/workflows/pr.yml`.

---

## Trigger

```yaml
on:
  pull_request:
    branches:
      - master
```

The pipeline runs **only on pull requests that target `master`**.  
Direct pushes to `master` do not trigger this workflow.

---

## Job: `ci` — Lint, Type-Check, Test

Runs on a fresh **`ubuntu-latest`** runner.

---

### Step 1 — Checkout repository (`actions/checkout@v4`)

Checks out the pull request's merge commit so all subsequent steps operate
on the exact code that would be merged.

---

### Step 2 — Setup pnpm (`pnpm/action-setup@v4`)

Installs the pnpm package manager at **version 9**.  
Pinning to v9 keeps the lockfile format (`lockfileVersion: 9.0`) consistent
across local machines and CI — a version mismatch can corrupt the lockfile.

---

### Step 3 — Setup Node.js 20 (`actions/setup-node@v4`)

Installs **Node.js 20** and enables **pnpm store caching**.

Cache key: `<OS>-<hash of pnpm-lock.yaml>`

The cache is automatically invalidated whenever any dependency changes —
no manual cache-busting required.

---

### Step 4 — Install dependencies

```bash
pnpm install --frozen-lockfile
```

`--frozen-lockfile` prevents pnpm from implicitly updating the lockfile.
If `package.json` and `pnpm-lock.yaml` are out of sync the step fails,
which surfaces the problem in CI rather than silently producing an
inconsistent install.

---

### Step 5 — Lint check

```bash
pnpm run lint
```

Runs ESLint with `--max-warnings 0` (configured in `package.json`).
Any ESLint warning is treated as a hard failure, keeping the codebase
warning-free. The config also enforces import ordering via
`eslint-plugin-simple-import-sort`.

---

### Step 6 — TypeScript type-check

```bash
pnpm exec tsc --noEmit
```

Validates TypeScript types across the whole project without emitting any
output files. `pnpm exec` runs the locally-installed `tsc` binary, not a
globally-installed one, ensuring the CI TypeScript version matches `devDependencies`.

---

### Step 7 — Run unit tests

```bash
pnpm run test
```

Runs Vitest in single-pass mode (`vitest run`). Tests are written with
`@testing-library/react` for component tests and plain Vitest for
store/utility unit tests.

---

### Step 8 — Cache Playwright browsers (`actions/cache@v4`)

Browser binaries (Chromium, ~300 MB) are stored separately from the pnpm
store because Playwright downloads them to `~/.cache/ms-playwright`, not
inside `node_modules`.

Cache key: `playwright-browsers-<OS>-<hash of pnpm-lock.yaml>`

When only non-Playwright deps change the old browsers cache is reused via
the `restore-keys` fallback:
```
playwright-browsers-<OS>-
```

---

### Step 9 — Install Playwright browsers (conditional)

```yaml
if: steps.playwright-cache.outputs.cache-hit != 'true'
run: pnpm exec playwright install --with-deps chromium
```

On a **cache miss**: installs the Chromium binary **and** its OS-level
shared-library dependencies (e.g. `libglib2.0-0`, `libnss3`).  
`--with-deps` is required; without it the browser binary exists but
won't launch because the OS packages are missing.

---

### Step 10 — Install Playwright system dependencies (conditional)

```yaml
if: steps.playwright-cache.outputs.cache-hit == 'true'
run: pnpm exec playwright install-deps chromium
```

On a **cache hit**: the browser binary is restored from cache, but the
OS-level shared libraries are **not** cached (they live in system paths).
`install-deps` installs only those system packages without re-downloading
the large browser binary.

---

### Step 11 — Run E2E tests

```bash
pnpm run test:e2e
```

With `CI=true` the `playwright.config.ts` activates:
- `forbidOnly: true` — a `.only()` left in code fails the suite
- `retries: 2` — each test gets up to 2 retries to survive flakiness
- `workers: 1` — serialises tests to avoid port conflicts on the shared runner
- `webServer` — starts `pnpm dev` automatically; no explicit server step needed

---

### Step 12 — Upload Playwright report (on failure)

```yaml
if: failure()
uses: actions/upload-artifact@v4
```

Uploads the full HTML Playwright report as a build artifact retained for
**7 days**. Lets you open the visual test report directly from GitHub
without re-running the pipeline.
