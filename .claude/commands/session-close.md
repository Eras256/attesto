---
name: session-close
description: End-of-session hygiene check — audits CLAUDE.md, AGENTS.md, SKILL.md, and the memory system for what genuinely needs updating, file by file, against each file's real purpose, not a generic "make sure it's current."
---

Before ending this session, audit each of the following against its own
real purpose — don't touch a file just because it's on this list, only
if something concrete actually changed today that belongs there.

**`CLAUDE.md` / `AGENTS.md`** — only update if a hard rule that should
apply to *every future session* was decided or changed today. Not facts,
not project status, not history — only standing rules. If `AGENTS.md`
exists, confirm `CLAUDE.md` still imports it (`@AGENTS.md`) and both stayed
in sync. If nothing rule-level changed, say so explicitly instead of
padding the file.

**`.claude/skills/*/SKILL.md`** — only update if the *actionable process*
a skill describes changed today, not if a fact behind it changed. A new
number, date, or one-off decision does not belong in a Skill file — it
belongs in memory or in a project doc the skill can reference. If a
recurring task done today doesn't have a Skill yet and clearly will repeat,
say so and propose one — don't create it silently without flagging it.

**The memory system** (external, `~/.claude/projects/.../memory/`) — this
is where real facts, decisions, and their reasoning go: what changed today,
why, and how it should be applied later. Update or create memory entries
for anything from today that a future session would need to know and that
isn't already captured elsewhere. Follow this workspace's own memory
discipline (check for an existing entry to update before creating a new
one, keep `MEMORY.md`'s index in sync).

**Report back in this shape, not a wall of prose:**
- CLAUDE.md/AGENTS.md: changed / not needed, one line either way.
- Skills: changed / new one proposed / not needed.
- Memory: what was added or updated, or "nothing new to persist."

If everything reports "not needed," that's a valid and honest outcome —
don't invent a change to have something to report.
