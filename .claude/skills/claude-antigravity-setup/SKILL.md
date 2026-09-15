---
name: claude-antigravity-setup
description: >
  How to configure and optimize a Claude Code + Antigravity session for any
  project — CLAUDE.md/AGENTS.md structure, memory, Skills, hooks, subagents,
  context window and compaction limits, token cost reduction, and Anthropic's
  persistent memory tool. Use when starting a brand-new project or folder in
  this workspace, when CLAUDE.md is getting long, when a session hits
  context/compaction limits, when deciding whether something should be a
  Skill vs. a hook vs. inline CLAUDE.md content, when asked about
  performance, token usage, or session duration, when pasting an image or
  screenshot into a session, when resuming a session with `--continue`,
  when about to publish a PR, issue, or comment on GitHub, or when about
  to use the Google Drive MCP tools. Full research and dated sources in
  `playbooks/PLAYBOOK-claude-antigravity-setup.md` — this skill is the
  actionable summary, that file is the depth.
allowed-tools: [Read, Edit, Write, Grep, Glob, Bash]
---

# Setting up a new project for Claude Code + Antigravity

Read the full research first if this is the first time using this skill:
`playbooks/PLAYBOOK-claude-antigravity-setup.md`. This file is the checklist
to actually execute, not a duplicate of that reasoning.

## Do this for every new project, from the start — not after it grows

1. **Create `CLAUDE.md` at the project root, and keep it under ~200 lines.**
   Hard rules that apply always go here. Everything else (history, one-off
   decisions, deep reference material) goes in its own file, referenced by
   link, not pasted inline. A `CLAUDE.md` that's already long on day one is
   a sign something belongs in a separate doc instead.
2. **Create `AGENTS.md` at the root too, same hard rules**, and add
   `@AGENTS.md` as the first line of `CLAUDE.md` so it imports automatically.
   This keeps Antigravity and Claude Code reading the same rules from one
   real source, regardless of which one natively reads which file — that
   compatibility question is still unresolved upstream (see the playbook
   §4), so don't depend on either tool reading the other's file on its own.
3. **Set up the external memory pointer if this project will span multiple
   sessions over time** — same pattern already used in this workspace:
   memory files live outside the project folder so they survive it being
   moved or deleted.
4. **Before writing a new Skill, check if a hook fits better.** If the thing
   you want to happen should *never* be skippable or forgettable (a
   register-cleanup check, a licence-gate check before a commit), it belongs
   in a hook (`.claude/hooks/` or `settings.json`), not a Skill — Skills only
   load when the model judges them relevant, hooks run deterministically
   every time the trigger event fires.
5. **Only include the files a task actually needs**, not whole directories —
   real, measured savings (60-80% fewer tokens for equal output quality, per
   the playbook §7).
6. **Run `/compact` proactively at the end of a discrete sub-task**, don't
   wait for auto-compaction at ~83.5% usage. Use `/recap` when resuming a
   session after a break instead of re-reading the full history.
7. **Copy `.claude/commands/session-close.md` into every new project too.**
   Run `/session-close` at the end of a session instead of a vague "make
   sure everything's updated" — it audits CLAUDE.md/AGENTS.md, Skills, and
   memory separately, against each one's real purpose, and treats "nothing
   needed" as a valid answer instead of padding files for the sake of
   reporting a change.
8. **Copy `playbooks/continue.md` into every new project too, and add its
   two rules to the end of `AGENTS.md`.** One covers resuming with
   `claude --continue` efficiently — it reloads the full conversation by
   design, so the saving is in not re-reading or re-verifying what's
   already in context, not in avoiding the reload. The other is
   zero-hallucination / verify-fresh: anything date-dependent gets checked
   live, never asserted from training memory. `continue.md` alone does
   nothing without those two lines in `AGENTS.md` — same lesson as this
   Skill needing to exist for the playbook itself to actually load.
9. **Copy `playbooks/images.md` into every new project too, and add its
   two rules to the end of `AGENTS.md`.** Image token cost is area-based
   (⌈width/28⌉ × ⌈height/28⌉ visual tokens per the official Claude vision
   docs) — cropping a screenshot before pasting cuts cost proportionally,
   compressing the file does not. The second rule covers prompt-cache
   mechanics: pasting one image at a time across separate turns forces a
   full cache rewrite each time, since any added or removed image
   invalidates the message cache — batching related screenshots into one
   turn avoids that. Same install pattern as step 8: the file alone does
   nothing without its two lines in `AGENTS.md`.
10. **Copy `playbooks/git.md` into every new project too, and add its rule
    to the end of `AGENTS.md`.** Every PR/issue/comment published on
    GitHub — own repo or someone else's — gets written humanized and
    concise, keeps the AI co-authorship trailer visible, and proposes a
    fix (not just a bug report) once the root cause is confirmed with
    real evidence, never forced on an unconfirmed cause. Same install
    pattern as steps 8-9.
11. **Copy `playbooks/drive.md` into every new project too, and add its
    rule to the end of `AGENTS.md`.** The Google Drive MCP isn't the
    default way to read a Doc/Sheet/Slide — try asking the user to paste
    the content, or WebFetch if the doc is genuinely public, before
    loading it. Reserve it for verifying private content that's about to
    go external. Same install pattern as steps 8-10.

## Quick answers to the questions this skill gets asked most

- **"Does a new session remember everything automatically?"** Only
  `CLAUDE.md` (in full, every session) and this workspace's external memory
  system (per its own setup) load without being asked. A Skill's full
  content, or any other file just linked from `CLAUDE.md`, does not — that's
  exactly why this project-setup process itself needed to become a Skill
  rather than staying a plain markdown file.
- **"Is SKILL.md a Claude Code thing or an Antigravity thing?"** Both — same
  folder-plus-`SKILL.md`-plus-YAML-frontmatter format in both tools as of
  2026. Write one, it works in either.
- **"What's the real context limit?"** 200K tokens standard plan, up to 1M
  on Max/Team/Enterprise via Opus 4.6. Full detail and compaction mechanics
  in the playbook §6.

## When to update this skill vs. the playbook

New dated research findings (a changed limit, a new command, a resolved
version of the AGENTS.md compatibility question) go in
`playbooks/PLAYBOOK-claude-antigravity-setup.md` first, with sources. Only
update this file's own checklist steps if the *actionable process* itself
changes, not just a number behind it.
