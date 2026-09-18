ATTESTO — BRAND ASSET PACK
===========================
Last built: 2026-09-17

WHAT THE MARK IS
-----------------
An "A" whose crossbar is a checkmark. Attesto's whole product is: pay for
a check, get a permanent, independently-verifiable proof that the check
happened. The mark says that in one shape — the letter and the checkmark
are the same stroke, not two things glued together.

Two versions of the icon:
- The plain icon (no ring) — use this everywhere small: favicons, app
  icons, buttons, anywhere under ~100px.
- The "sealed" version (same icon inside a thin ring) — use this where
  there's room to breathe: social avatars, the OG share image, big
  splash moments. The ring is a nod to a wax seal / notary stamp — a
  literal mark of "this has been verified."

Known, tested limitation: at 16-32px (favicon size), the checkmark reads
as a small notch, not obviously a checkmark — it still reads as a clean,
solid "A" at that size, which is what actually matters there. The
checkmark payoff shows starting around 64px and especially at the
"featured" two-color size. This was verified with real screenshots, not
assumed — see QA notes below.

COLORS
------
Ink       #161311   — the primary dark color. Used for the icon on light
                       backgrounds and as body text color.
Parchment #F7F3EC    — the light background / the icon's color on dark
                       backgrounds. Not pure white — warm, paper-like,
                       ties into the "attestation as a document" idea.
Seal Gold #A56A00    — the accent, used ONLY for the checkmark stroke in
                       the two-color "featured" version. Never use it as
                       a body text color or a large fill — it's an accent,
                       not a primary.

Contrast, checked against real WCAG numbers (not eyeballed):
- Ink on Parchment: 16.7:1 (passes everything)
- Seal Gold on Ink: 4.1:1 / Seal Gold on Parchment: 4.1:1 (passes the
  3:1 bar for icons/large elements on both; this is why it's the same
  gold value on both backgrounds instead of two different ones)
Also checked in grayscale (a stand-in for colorblindness): the gold
checkmark still reads as a distinctly different shade from the ink, not
just a different hue — so it doesn't disappear for someone who can't
tell gold from black by hue alone.

TYPOGRAPHY
----------
Inter, weight 900 (Black) for the wordmark, with tight letter-spacing
(-1.2px at the size shipped in the lockup SVGs — scale proportionally).
Inter is already used across attesto.xyz and is properly licensed for
commercial use (SIL Open Font License, via Google Fonts) — this wasn't
a new font decision, just confirmed as the right one to keep for the
wordmark too, instead of introducing a mismatched second typeface.

ONE REAL LIMITATION, FLAGGED HONESTLY: the wordmark in the SVG files
uses a live <text> element set to render in Inter, not hand-converted
outlines. It will look right anywhere Inter is loaded (which covers the
actual site, since it's already self-hosted there) — but if you ever
need a fully font-independent vector (e.g. for print, or embedding
somewhere with no web fonts), that text needs to be converted to real
paths first. Not done here — flagging it rather than shipping something
that quietly breaks in an unusual context.

FILES
-----
svg/
  logo-mono-light.svg / logo-mono-dark.svg   — plain icon, one color
  logo-featured-light.svg / logo-featured-dark.svg — icon, gold checkmark
  logo-hero-light.svg / logo-hero-dark.svg   — sealed/ring version
  logo-lockup-light.svg / logo-lockup-dark.svg — icon + wordmark
  favicon.svg                                 — icon on a rounded dark tile
  badge-verified.svg                          — small embeddable "Verified
                                                 by Attesto" badge, for a
                                                 site that passed a
                                                 skill-check to show it

png/
  logo-icon-<light|dark>-<512|1024|2048>.png  — transparent icon
  logo-hero-<light|dark>-<512|1024>.png       — transparent sealed icon
  logo-lockup-<light|dark>-1600.png           — transparent icon+wordmark
  favicon-<16|32|48|180|512>.png, favicon.ico — favicon set
  logo-avatar-ink-<800|1600>.png              — solid-background social
                                                 avatar (square; most
                                                 platforms crop it circular
                                                 themselves)
  social-og-banner-1200x630.png               — link-preview banner

construction-misuse-guide.png                  — one image, six examples:
                                                  five real "don't"s
                                                  (stretched, recolored,
                                                  rotated, bevel/shadow,
                                                  busy photo background)
                                                  and one correct usage,
                                                  actually rendered, not
                                                  just described.

HOW TO USE IT
-------------
- Clear space: leave a gap around the mark at least as tall as the
  checkmark stroke itself on every side. Don't crowd it against other
  logos, text, or the edge of its container.
- Minimum size: 24px digital (below that, use the favicon tile version,
  which has its own solid-background padding built in), 6mm print.
  Both derived from what actually still read clearly in testing, not a
  guessed round number.
- Don't do the things shown in construction-misuse-guide.png.
- File naming: logo-<variant>-<bg>-<size>.<ext>. If you need a new size
  not included here, re-export from the matching SVG rather than
  stretching a PNG.

WHAT THIS PACK DOES NOT INCLUDE (on purpose)
---------------------------------------------
Motion/animation specs and a voice/tone guide were not built — they
weren't asked for, and building them without being asked is exactly the
kind of scope creep this project's own AGENTS.md flags as a failure
pattern. Both are real next steps if/when they're actually needed.

BEFORE YOU SHIP THIS AS THE REAL LOGO — READ THIS
----------------------------------------------------
See "clearance findings" in the handoff notes from the session that
built this pack. Short version: there is a real, currently-active US
trademark registration for the word "Attesto" in the same software-
services class this product is in. That's a business/legal decision for
you to make, not something this pack resolves — it's flagged, not fixed.
