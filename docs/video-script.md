# Attesto — pitch/demo video script (draft)

**Deadline, verified live 2026-10-07 against the official rules PDF**
(`colosseum.com/legal/Crypto World's Fair Hackathon Rules.pdf`, Section 5):
submissions close **11:59pm PT (Pacific Time) on October 12, 2026** —
"Administrator's computer is the official time-keeping device." Plan says
submit by 11-oct as buffer; that buffer is real, not just caution — PT
means whatever's recorded needs to land before 11:59pm Pacific specifically,
not midnight in any other zone.

**Video length/format: still not specified anywhere public.** The official
rules (Section 12) only require Content to be in English and not violate a
third-party video platform's own terms — no minutage, no format, no
upload-location requirement anywhere in the PDF, the public `/worldsfair`
page, or its FAQ. This was checked directly against the primary source, not
inferred. **The real spec is almost certainly only visible inside the
logged-in submission dashboard/form** (team registration already exists,
per `docs/CHECKLIST-panel-review.md`) — that needs a human to check, an
agent session has no login for it. Target below stays **~3 minutes**,
segmented so it splits into pitch+demo separately if the real form wants
that — confirm in the dashboard before the final cut, trim/split
accordingly.

Every claim below is something already true in the shipped product or repo
— nothing invented for the pitch. Cross-reference: README.md, DECISIONS.md,
`app/components/attesto/try-it.tsx`.

## Shot list (timed)

| Time | Shot | Source |
| --- | --- | --- |
| 0:00–0:30 | Talking head / slide — the problem | Segment 1 |
| 0:30–0:40 | Screen: attesto.xyz, paste address, click "Get price" | Segment 2, beat 1 |
| 0:40–0:55 | Screen: 402 quote renders (amount, pay-to, expiry countdown) | Segment 2, beat 2 |
| 0:55–1:05 | Screen: check jurisdiction box, click Connect Wallet | Segment 2, beats 3–4 |
| 1:05–1:25 | Screen: click Pay, wallet signature prompt, confirm | Segment 2, beat 5 |
| 1:25–1:50 | Screen: result renders — score/100 + volume/recency/diversity | Segment 2, beat 6 |
| 1:50–2:00 | Screen: click through receipt + tx links to Solana explorer | Segment 2, beat 7 |
| 2:00–2:30 | Talking head / architecture slide — what's novel (Prova + Vouch402 lineage) | Segment 3 |
| 2:30–3:00 | Both founders on camera — team, bus-factor, call to action | Segment 4 |

## Demo address — use this, not Attesto's own program

**Use `GoNaEo5bAAFpBADnuqE8E3M3DqCMEcYVE8LzcVxjRNPS`** when pasting into
"Solana address to check." Verified live 2026-10-07 directly against
devnet RPC (`getProgramAccounts` on Prova's program
`G11dBAzLQaADtHHM2AZNz3ThCDnkY5nhX3Ujddu1CMM1`, decoding the real
`prova_agent` account layout) and cross-checked against the live quote
endpoint (`curl https://attesto.xyz/v1/skill-check/<address>` returns a
real 402 for it):
- **167,117 attestations, not revoked** — caps the volume component at
  50/50 (formula is `min(count, 20) / 20 * 50`, so this clears it many
  times over).
- **Attestations landing ~once a minute, still live right now** — the most
  recent one at check time was under 2 minutes old, which caps recency at
  30/30 (`<=30 days` rule).
- Floor on the final score is therefore **80/100** from volume+recency
  alone; diversity (0-20) adds on top. This is a real, continuously-active
  agent in Prova's actual devnet registry, not Attesto's own program (which
  would show 0/100 — empty, wrong demo).
- **Do not use the Attesto program ID** (`EgLkDDxhS1Cd61VjJzMSURC1zko3xtbcAexQqyGBqvdk`)
  for this — that's Attesto's own program account, has no Prova attestation
  history, and would render the demo's main screen empty.

---

## Segment 1 — The problem (0:00–0:30)

**Visual:** talking head or slide, not screen recording yet.

**Voiceover:**
> AI agents are starting to hire each other, pay each other, and act on
> each other's behalf — on-chain, autonomously, with no human clicking
> "approve." That only works if an agent can trust who it's dealing with.
> Right now, most of that trust is just... vibes. A wallet address and
> hope.
>
> Attesto is a paid API an agent calls before it hires or transacts with
> another agent: pay a few cents in USDC, get back a skill-check score
> backed by real on-chain history — and a receipt of that check, minted
> on-chain, that anyone can verify independently.

---

## Segment 2 — Live demo (0:30–2:00)

**Visual:** screen recording, attesto.xyz, real devnet, real wallet.

**Beats to actually click through (matches the real Try It flow in
`app/components/attesto/try-it.tsx`):**

1. Paste a Solana address into "Try it" → click "Get price."
2. Show the 402 response rendering as a live quote: amount (USDC),
   pay-to address, expiry countdown. Narrate: *"This isn't a mockup —
   that's a real 402 Payment Required response, live off our own API."*
3. Check the jurisdiction self-certification box.
4. Click "Connect Wallet" → connect a real devnet wallet holding devnet
   USDC.
5. Click "Pay X USDC & get attestation." Wallet prompts to sign — **one
   transaction**, narrate: *"One signature. It's a transferChecked
   payment plus a memo that binds this exact payment to this exact
   request — nobody else's payment can be replayed against my query, and
   mine can't be reused for a second one."*
6. Result renders: score /100, the volume/recency/diversity breakdown,
   and — critically — links to the fulfillment receipt and the
   attestation transaction on a Solana explorer.
7. Click through to the explorer. Narrate: *"That receipt isn't something
   I'm telling you exists — it's on-chain, you can look it up yourself,
   right now, without trusting my server."*

**Voiceover under the demo, if not narrating each click live:**
> Every skill-check settles atomically — the agent pays, we verify the
> payment straight against Solana RPC ourselves, no facilitator in the
> middle, and we mint our own attestation of what we returned. No
> account. No balance sitting on our servers. No credit. Just one paid
> request, one verifiable receipt.

---

## Segment 3 — What's actually novel here (2:00–2:30)

**Visual:** back to talking head, or a simple architecture diagram slide.

**Voiceover:**
> Two things make this different from "just another paid API."
>
> First: the score is sourced from Prova, a real, separately-deployed
> on-chain attestation registry our team already operates in production
> — not invented data for a demo. Attesto reads Prova's registry and
> writes its own, separate attestations to its own program on Solana.
>
> Second: we didn't build the payment-verification pattern from scratch
> for this hackathon. It's the same pay → verify → attest → dispute shape
> already live in production on Vouch402, our EVM product — ported to
> Solana and Anchor, with a new kind of data behind it. This isn't our
> first time proving this model works with real money moving through it.

---

## Segment 4 — Team & what's next (2:30–3:00)

**Visual:** talking heads, both founders on camera if possible — the
submission's own bus-factor point (docs/CHECKLIST-panel-review.md) is
exactly the thing to make visible here, not just claim in a form field.

**Voiceover:**
> [Giovanny] — I built the payment verification, the Anchor program, the
> replay protection.
> [Monserrat] — I built the product experience you just saw, attesto.xyz,
> and pushed on the parts that don't survive a real user clicking
> through them.
>
> Attesto is live on devnet right now, today, at attesto.xyz. We're
> looking for more real testers outside our own team, and we'd love
> yours.

**End card:** attesto.xyz · GitHub link · Colosseum Solana track

---

## Things to swap in before recording

- [ ] **Still open:** confirm actual video length/format from the logged-in
      submission dashboard (not public anywhere — checked 2026-10-07)
- [ ] **Still open:** confirm whether a combined video or separate
      pitch+demo is expected — same dashboard check as above
- [x] Demo address confirmed: `GoNaEo5bAAFpBADnuqE8E3M3DqCMEcYVE8LzcVxjRNPS`
      (see above) — verified live against devnet and the production quote
      endpoint 2026-10-07
- [x] Deadline confirmed: 11:59pm PT, October 12, 2026 (official rules PDF,
      verified live 2026-10-07)
- [ ] Record demo against whatever backend is live at record time — the
      payment-error-explanation fix shipped 2026-10-07, confirmed live;
      no other pending backend changes known as of this draft
- [ ] Fill in Monserrat's own words for her segment — the line above is a
      placeholder, not something to read verbatim without her sign-off
- [ ] Get a real fulfillment receipt + transaction on an explorer queued
      up before recording — the chosen demo address is a live, continuously
      -active account, so a fresh paid skill-check against it will itself
      produce a fresh receipt/tx; no need to pre-stage one
- [ ] **Do not run `anchor test` again before recording** — Anchor.toml
      points `cluster` at devnet, so every run redeploys the live program
      for real (confirmed 2026-10-07, signature `4h2X2V...tsq`)
