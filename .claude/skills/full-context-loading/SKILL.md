---
name: full-context-loading
description: >
  How every answer in this project should already reflect the full
  stack of available context — this project's CLAUDE.md/AGENTS.md,
  persistent memory, this project's own hand-built skills, Claude's
  global skills, and any installed community/network skill packages —
  without re-reading everything on every turn or bloating token usage.
  Covers what already loads automatically for free, what the actual
  discipline fix is (checking what exists before answering from
  scratch), what NOT to do (force full preload of every skill body),
  and a live inventory of what exists in this project so a fresh
  session doesn't have to rediscover it. Use at the start of a new
  session, when asked "do you have full context," or whenever an
  answer risks being generic instead of grounded in what this project
  already knows.
---

# Full context loading — every answer grounded, without re-reading everything

## What already loads automatically, every session, at zero extra cost

No action needed for these — verified true for this project:

- **`CLAUDE.md` (imports `AGENTS.md`)** — injected as project
  instructions automatically at session start. Attesto's hard rules
  (atomic settlement, no per-client balance, the three-key separation,
  banned copy words, attesto_program vs prova_program separation) live
  in `AGENTS.md`.
- **The persistent memory system** — `MEMORY.md`'s index (at
  `~/.claude/projects/-home-vaiosvaios-attesto/memory/MEMORY.md`) loads
  automatically every session; the full content of any individual
  memory entry loads only when read. Check the index before answering
  something it might already cover — don't re-derive a fact memory
  already has.
- **Every installed Skill's name + description** — Claude Code shows
  this list automatically at session start, at a cost of tens of tokens
  per skill. The **full body** of a skill loads only when a task
  matches its description (via the `Skill` tool) or is loaded here
  explicitly. **This is already the token-saving mechanism this project
  needs — it does not need to be rebuilt.**

## The real fix: actively check before answering, don't wait to be told

The gap this skill exists to close isn't a missing preload — it's a
session answering a non-trivial request as if none of the above
existed, when a quick check would have surfaced something directly
relevant. Before answering anything beyond a trivial or purely
conversational request, run this check:

1. **Does an available Skill's description match this task?** If yes,
   invoke it (`Skill` tool) instead of reasoning from scratch what it
   already documents.
2. **Does `MEMORY.md`'s index name something relevant?** Read that
   entry before asserting a fact "from nothing" — a past correction, a
   verified figure, a standing decision may already be there.
3. **Does a playbook in `playbooks/`** (already referenced from
   `AGENTS.md`) **already cover this kind of task?**
4. **Is there a network-specific or community skill installed** (via
   `ecosystem-skills-installer`) **that's more current than what's in
   memory or in a hand-built skill?** Skill packages get updated
   independently of this project's own memory.

This is a discipline to apply every time, not a one-time setup step —
the same lesson `playbooks/continue.md` already states for resuming a
session ("no releas lo que ya está en contexto ni reverifiques lo ya
verificado") generalizes here to "don't answer from a blank slate what
an already-available resource already covers."

## What NOT to do — don't force full preload

Loading every skill's entire body and every memory entry into context
on every session start would cost real tokens for content irrelevant
to most requests — this directly fights the goal of not wasting
tokens, not serves it. The name+description-only preload already IS
the correct mechanism for exactly this tradeoff: cheap awareness that
something exists, full cost only when it's actually used. Don't try to
route around it by dumping full content somewhere it'll be re-read
every turn.

## Inventory — what exists in Attesto right now

Verified directly (`ls .claude/skills`, `find ~/.claude/skills`, reading
the real files) on 2026-09-18. Not copied from any sibling project.

- **This project's own hand-built skills** (`.claude/skills/`):
  `mexico-legal-check`, `teammate-commit-identity`,
  `claude-antigravity-setup`, plus this skill, `grants-track-record`,
  `hackathon-fit-check`, `public-claim-verify`, `repo-security-sweep`,
  `doc-accuracy-audit`, `portfolio-funding-rollup`,
  `ecosystem-skills-installer` (portable variant — this project is
  individual, not a hub, so it has no `cross-session-hub` or
  `new-ecosystem-hub`).
- **Claude's own global skills** (`~/.claude/skills/`) — this machine
  has other, unrelated Stellar-specific tooling installed globally that
  is **not scoped to Attesto** (`deploy-stellar-mainnet`, `stellar-help`,
  `find-stellar-idea`, `stellar-competitive-landscape`, the SCF-*
  family, etc.) — don't rely on those for Attesto work without
  rechecking their scope actually applies. Two that ARE genuinely
  relevant to this project and have already been used successfully
  this session: `branding-pack` (symlinked from
  `~/.agents/skills/branding-pack`, used to build
  `branding/attesto/` and `public/branding-attesto/`) and
  `headless-browser-without-root` (the msedge-via-WSL-interop pattern
  used for that same work's screenshot QA). Generic ones like
  `code-review`, `security-review`, `investigate`, `reprompt` are
  available and not project-specific either way.
- **Community/network skill packages** — **none installed yet.** A real
  candidate was found and verified 2026-09-18 but not installed:
  `solana-foundation/solana-dev-skill` (560 stars, not archived, pushed
  2026-09-09 — "Skills for agentic development on Solana") and
  `solana-foundation/pay-skills` (pushed 2026-09-11, directly relevant
  given Attesto is an x402/payment product). See
  `ecosystem-skills-installer` before installing either — Step 2's
  "read the real content first" applies, this hasn't been done yet.
- **Playbooks** (`playbooks/*.md`): `continue.md`, `images.md`,
  `drive.md`, `git.md` — an already-proven config pattern adopted
  2026-09-15 (see `AGENTS.md`'s own reference), real and in active use
  this session.
- **Persistent memory**: single real index at
  `~/.claude/projects/-home-vaiosvaios-attesto/memory/MEMORY.md` — no
  naming collision with any project-root doc found (Attesto has no
  second file also called `MEMORY.md`).

**`.gitignore` checked 2026-09-18 (`git ls-files` + `git check-ignore
-v` on each real `SKILL.md`): clean, no broad rule hiding skill files
from version control.**

## Verifying anything date-sensitive — always fresh, never from training memory

Already a hard rule in `AGENTS.md` ("Cero alucinación... todo lo
dependiente de fecha se verifica en vivo antes de afirmarlo") — this
skill doesn't duplicate it, only reinforces it in this context: a
memory entry or a skill's own text can be stale by the time it's read.
When a task needs external, current information (a price, a version, a
legal deadline, a repo's live state), verify it live via
WebSearch/WebFetch/`gh api`/`npm view` on the day it's asked, every
time — regardless of how confidently a prior memory or skill states it.

## Related

`claude-antigravity-setup` (initial project setup; this skill is the
ongoing-discipline complement to it), `ecosystem-skills-installer` (how
the two candidate Solana packages above would get verified further and
installed), `session-close` (the end-of-session hygiene check that
keeps this inventory from going stale).
