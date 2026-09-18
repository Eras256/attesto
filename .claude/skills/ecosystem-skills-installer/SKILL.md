---
name: ecosystem-skills-installer
description: >
  How to actively find whether an official or community "ecosystem
  skills" package exists for a given blockchain/network (like
  `base/skills` for Base, `hedera-dev/hedera-skills` for Hedera,
  `Ayomisco/avaxskills` for Avalanche, `solana-foundation/solana-dev-skill`
  for Solana), verify it's real before installing anything, and decide
  whether it's a genuine complement to this project's own hand-built
  skills or something to skip because no real package exists (or the
  thing found isn't actually what its name suggests). Use when the user
  asks "is there a skill for network X," before building a
  project-specific skill from scratch (check for an official one to
  build on top of first), or periodically to recheck whether a package
  found-but-not-installed has meaningfully updated.
---

# Ecosystem skills installer — find, verify, and decide, don't assume

Every network with an active developer ecosystem tends to accumulate a
community or official "agent skills" package — a pre-written manual for
how to build correctly on that specific network. Before hand-building a
project-specific skill from scratch, check whether one already exists.

**Portable/individual-project version of this skill** — the original
covers a Step 5 (relaying a verified finding to a sibling hub session
via `ListAgents`) that doesn't apply here: this project doesn't own or
coordinate any other project's repo, so once a package is verified, the
decision to install it is made directly in this same session, not
relayed anywhere.

## Step 0 — Actively search, don't wait for a claim to verify

For Solana (or any other network this project ever touches), go find
out directly rather than waiting for someone to hand you a claim to
check:

```
WebSearch: "<network name> agent skills claude code" / "<network name>
skills.sh" / "site:github.com <network name> skills SKILL.md"
gh api orgs/<network-foundation-org>/repos --jq '.[].name' --paginate
```

Check the same handful of places every time: the network's own GitHub
org (a repo literally named `skills` or `<network>-skills` or
`<network>-dev-skill`), the network's official docs site for a
`skill.md`/`SKILL.md` reference, and the general agent-skill
directories (`skills.sh`, `skillmd.com`, `openagentskill.com`). A
network's own foundation/company account is the first place to check
before assuming a third-party maintains it.

**A network can have zero, one, or several real candidates.** Don't
stop at the first hit — note every real candidate, then verify each one
in Step 1 before picking which (if any) to install.

## Step 1 — Never install (or relay) an unverified claim

Research about "does X have an official skill package" — whether from a
web search, a pasted answer, or another session's report — is a claim to
verify, not a fact to act on.

```bash
gh api repos/<org>/<repo> --jq '{full_name, archived, pushed_at, stargazers_count}'
npm view <package-name> version   # for an npm package claim
gh api orgs/<org>/repos --jq '.[].name' --paginate   # to check a negative claim (nothing exists)
```

A repo that's real, not archived, and recently pushed is a good
candidate. A repo that returns 404, or an org listing with nothing
skills-shaped in it, confirms a genuine absence — don't assume a gap
just because the first search didn't surface something; check the org's
full repo list before concluding "nothing exists."

## Step 2 — If a real package exists, read its actual content before installing

Don't install based on a README description alone — **a package's name
can be misleading about what it actually contains.** Read the real file
tree and the content of anything you'd actually rely on:

```bash
gh api repos/<org>/<repo>/git/trees/HEAD?recursive=1 --jq '.tree[].path'
gh api repos/<org>/<repo>/contents/<path-to-a-real-file> --jq '.content' | base64 -d
```

This matters for two reasons, both real and confirmed on this project
(2026-09-18):

1. **A package's name doesn't guarantee its actual shape.**
   `solana-foundation/pay-skills` sounds like a general x402/payments
   development skill for Solana; its real tree is a directory of
   `PAY.md`+`openapi.json` specs for specific third-party paid-API
   providers (agentmail, birdeye, blockrun, etc.) — a provider catalog,
   not a "how to build this" reference. Checked before recommending it,
   and correctly NOT installed as a dev skill because of what Step 2
   found — it might still be useful as competitive-landscape reading,
   a different use case entirely.
2. **Installing may carry real side effects beyond adding read-only
   skills.** Some packages bundle an installer that also writes hooks
   or other executable files, not just skill content — read the
   installer script itself (`install.sh` or equivalent) before running
   it, not just its own `--help` text. `solana-foundation/solana-dev-skill`'s
   `install.sh` was checked this way and confirmed clean: it only
   copies `SKILL.md` + reference files into `.claude/skills`/
   `.agents/skills`, no hooks, no other side effects.

## Step 3 — Audit the result after installing, don't trust the installer's own success message

An installer reporting "Installation complete" is not the same as
"nothing important changed or broke."

- **Name collisions**: an installer can silently overwrite an existing
  local skill with the same name (check the installer's own log for
  "overwrites"). If this happens, check what was actually lost: if the
  official version covers the mechanical content equally well or
  better, don't rebuild the overwritten file — but recover anything
  project-specific that had no other home, and relocate it.
- **New untracked paths landing in the wrong place.** An installer can
  write new directories/files (`.agents/`, a lockfile) at the project
  root without them being added to `.gitignore` correctly — check and
  fix before the next commit.
- Report failures the installer's own log lists, but don't assume they
  matter — check whether the failing tool/integration is even used in
  this project before treating it as a real problem.

## Step 4 — If no real package exists, build the project's own, but only from real evidence

When Step 1 confirms nothing official/community exists, build a
project-specific skill from scratch — same standard as everywhere else:
only build what has real evidence behind it (a real integration, a real
bug found and fixed, real code written), never a full speculative
library "to be safe." A verified official package from a *different*
network can still be used purely as a **structural** reference (e.g.,
adopting a per-skill references/ folder pattern for organization)
without copying its actual technical content, which doesn't transfer
between networks.

## Attesto's own findings, as of 2026-09-18

- **`solana-foundation/solana-dev-skill`** — real, verified (560 stars,
  not archived, pushed 2026-09-09), genuinely a Solana agentic-dev
  skill (Anchor, Kit, IDL codegen, common errors, frontend). `install.sh`
  read and confirmed clean. **Found and verified, not yet installed** —
  install decision is the user's, not made unilaterally by this pass.
- **`solana-foundation/pay-skills`** — real, verified (pushed
  2026-09-11), but its actual content (per Step 2) is a third-party
  paid-API provider catalog, not a payments-development skill. **Not
  recommended as a dev skill; ruled out for that purpose, not
  installed.**

## Related

`full-context-loading`'s Inventory section (where the above findings
are also logged, so a future session doesn't redo this search from
scratch).
