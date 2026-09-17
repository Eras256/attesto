# Attesto — pitch/demo video script (draft)

Target: ~3 minutes, structured in segments so it splits cleanly into a
separate presentation + demo video if the actual Colosseum submission form
turns out to want that instead of one combined video. **Not verified against
the real submission form** (the Official Rules PDF only says Content must be
in English and lists judging criteria — no minutage; the "2-3 min pitch + up
to 3 min demo" figure floating around search results wasn't confirmed
against a primary source). Confirm the real format/length in the submission
form itself before recording, and trim/split this accordingly.

Every claim below is something already true in the shipped product or repo
— nothing invented for the pitch. Cross-reference: README.md, DECISIONS.md,
`app/components/attesto/try-it.tsx`.

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

- [ ] Confirm actual video length/format from the real submission form
- [ ] Confirm whether a combined video or separate pitch+demo is expected
- [ ] Record demo against whatever backend is live at record time (Fly.io
      once the payment-binding fix ships, or wherever it ends up) — not
      the old paste-signature flow, that's being replaced
- [ ] Fill in Monserrat's own words for her segment — the line above is a
      placeholder, not something to read verbatim without her sign-off
- [ ] Get a real fulfillment receipt + transaction on an explorer queued
      up before recording, don't rely on live devnet being fast on the day
