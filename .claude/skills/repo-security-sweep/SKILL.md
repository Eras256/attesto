---
name: repo-security-sweep
description: >
  Audit a GitHub account or org's real repos for exposure — leaked
  emails in commit history, the "Activity overview" setting publicly
  naming private repos, secrets committed despite a later .gitignore
  (history still has them), registry tokens without 2FA, and
  .gitignore rules broad enough to hide real tracked files from git
  entirely (the opposite failure). Use before making an account/org
  public-facing (a profile going out in an application), periodically
  as hygiene, or after any incident involving a leaked credential.
---

# Repo security sweep — real exposure, not a checklist for its own sake

## Non-negotiables

- **A .gitignore added today does not protect history already
  committed.** Check `git log --all --full-history -- <path>` for
  anything sensitive, not just the current working tree.
- **"Private repo" and "not publicly discoverable" are different
  claims.** GitHub's "Activity overview" toggle on a profile can name
  private repos publicly even though their content stays hidden —
  check this explicitly, don't assume private means invisible.
- **A .gitignore can fail in either direction** — too narrow (leaks a
  secret) or too broad (silently excludes real files, like `SKILL.md`,
  from ever being tracked, so they vanish on a fresh clone). Check both.

## Step 1 — Email exposure across every repo

```bash
gh api users/<username>/repos --jq '.[].full_name' --paginate
# per repo:
git log --all --format='%ae %ce' | sort -u
```
Flag any personal email that shouldn't be public, across every repo —
including old/dead ones, which are often forgotten.

## Step 2 — The "Activity overview" gotcha

Check the account's own profile settings for whether private
contribution activity is set to show repo names publicly. If so, every
private repo's name (not content) is discoverable from the profile page
— decide deliberately whether that's acceptable, don't leave it as an
unconsidered default.

## Step 3 — Secrets committed despite current .gitignore

```bash
git log --all --diff-filter=A --name-only | grep -iE '\.env|secret|key|token|credential' | sort -u
```
For each hit, check whether it's still in history even if a later
commit removed/gitignored it — a removed file's content is still
retrievable from history unless the repo's history was actually
rewritten and force-pushed (a separate, higher-stakes fix).

## Step 4 — Registry tokens without 2FA

Check `~/.npmrc` (or equivalent for other registries) for a token, and
confirm the account it belongs to has 2FA enabled — a no-2FA token is a
single point of failure for publishing malicious versions of real
packages.

## Step 5 — .gitignore over-exclusion check

```bash
git ls-files | grep -c "SKILL.md\|<other real file pattern>"
git check-ignore -v <path-to-a-file-that-should-be-tracked>
```
Confirm files that should be tracked actually are — a broad rule (`*.md`,
`*.json`) can silently exclude real content from ever reaching a fresh
clone or a machine change.

## Step 6 — Dead repos

List repos with no activity in a long time that are still public and
serve no purpose — consider making them private rather than leaving
old, unmaintained code as a public surface.

## Output

A findings list, each with the real verification command used and its
result, fixed items marked with the actual commit/setting-change that
resolved them — not just "checked, looks fine."

## Attesto-specific context

The real risk surface here isn't just the app code — it's the three
separate devnet keypairs (`attesto-deployer`, `attesto-issuer`,
`attesto-treasury`) and the `ATTESTO_HMAC_SECRET`/`ATTESTO_ISSUER_SECRET_KEY`
env vars this session set directly on Fly (never on Vercel, on purpose
— see `DECISIONS.md`, 2026-09-17). Step 3's grep should specifically
include a pass for any of those keypair filenames or key-shaped JSON
arrays accidentally staged, on top of the generic `.env`/`secret`/`key`
patterns. Not yet run end-to-end on this repo as of 2026-09-18 — this
skill was installed today, not yet executed.
