# Decisions

Architecture and security calls made while building Attesto, with the
reasoning behind them — so anyone reading this later (a judge, an
investor, a future contributor) can see there was real judgment behind the
code, not just code. Newest first.

## 2026-09-17 — attesto.xyz (Vercel) proxies /v1/* to attesto-api.fly.dev; verified the memo/payment-marker fix against real production traffic

Deploying the payment-binding fix (see entry below) needed a backend that
can read `ATTESTO_ISSUER_SECRET_KEY`/`ATTESTO_HMAC_SECRET` from the
environment — Vercel's project for attesto.xyz never had either configured
(confirmed: `vercel env ls production` listed only 6 of the 8 required
vars), which is the actual reason "Try it" was broken in production before
today, not a filesystem-persistence issue as first assumed.

Rather than add the missing secrets to Vercel or migrate the domain's DNS
to Fly, kept a single public domain (attesto.xyz, matching every example
in the API reference docs) with the real backend logic living on Fly
(`attesto-api.fly.dev`) — same split Vouch402 already runs in production.
`next.config.ts`'s `rewrites()` forwards `/v1/:path*` to Fly using
`beforeFiles` (required: without it, Next.js resolves this same repo's
local `/v1/*` route files first and the rewrite never fires, since they
still exist in the codebase Vercel builds — they're just never reached
once the rewrite is in place). No secret exists on Vercel; the frontend
build there doesn't need any of the six either since values only matter at
request time.

Hit one build break doing this: `output: "standalone"` (added for the Fly
Docker image) makes Vercel's own build fail — it skips the trace files
Vercel's pipeline expects to post-process itself
(`ENOENT: .next/next-server.js.nft.json`). Made it conditional on
`process.env.VERCEL` (set automatically in Vercel's build environment),
so Fly still gets the standalone output it needs and Vercel gets its
normal build.

**Verified against real production traffic, not just locally**, a real
funded devnet wallet (funded from the project's own treasury/deployer
keys — the treasury ATA holds real USDC.deposit accumulated from earlier
real testing) ran the actual x402 flow against both `attesto-api.fly.dev`
directly and through `attesto.xyz`, four scenarios each, all as expected:

1. Real `transferChecked` + memo → `200`, a real fulfillment receipt and
   attestation transaction, both independently resolvable on an explorer.
2. Reusing that same payment signature against a *different* resourceId →
   `409`, rejected by the new on-chain `PaymentMarker` PDA.
3. Paying for one resourceId's memo, then trying to redeem a *different*
   resourceId with that same payment → `402`, rejected because the memo
   doesn't match — front-running closed.
4. A second, distinct, correctly-memo'd payment on the same address still
   → `200` normally, confirming the fix doesn't break legitimate repeated
   use.

## 2026-09-17 — First security review found the payment wasn't bound to a specific request; fixed with a Memo + an on-chain payment marker

Ran a real security pass (no prior audit had ever been done on this
codebase) before deploying a second production target. Two related
findings, both confirmed by reading the code directly, not just trusting
the review's output:

**The core problem:** `verifyPaymentTransaction` (`app/lib/server/verify-payment.ts`)
only checked that a confirmed `transferChecked` matched the right
destination, mint, decimals, and amount — nothing tied the payment
transaction to the specific `resourceId` being redeemed. `TREASURY_ATA` is
one shared address for every request, and confirmed transactions are
public on-chain data.

- **Front-running:** anyone watching devnet for a confirmed
  `transferChecked` of the exact quoted amount to the treasury ATA could
  grab that signature and redeem it against their own `resourceId` before
  the legitimate payer's own retry — a stranger's real payment, stolen.
- **One payment, many mints:** the only reuse guard was an off-chain
  `getProgramAccounts` memcmp scan (`findReceiptByPaymentSignature`), run
  *before* payment verification and the on-chain mint — a real TOCTOU
  window. Two concurrent requests with the same payment signature but
  different `resourceId`s both passed the scan (neither receipt existed
  yet) and both minted, because the receipt PDA is seeded only on
  `resource_id`, not on the payment signature. One real payment could fund
  unlimited attestations. This is exactly the "crédito prepagado" failure
  mode the project's own hard rule (AGENTS.md, atomic settlement) warns
  about — reached via a race instead of an explicit balance field.

**Fix, two parts:**

1. **Payment binds to a specific resourceId via SPL Memo.** The client now
   builds `[create-ATA-if-needed, transferChecked, memo]` in one
   transaction — the memo (program `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`)
   carries the exact `resourceId` token string being redeemed.
   `verify-payment.ts` now requires that memo to be present and to match
   before accepting the payment; a transfer of the right amount with no
   memo (or the wrong one) is rejected outright. This closes the
   front-running path: a stolen signature carries someone else's
   `resourceId` in its memo, not the attacker's.
2. **One payment, one mint, enforced on-chain.** Added `PaymentMarker`
   (`anchor/programs/attesto_program/src/state/payment_marker.rs`), a PDA
   seeded on `payment_signature_hash` and `init`'d in the *same*
   `record_fulfillment_attestation` instruction as the `FulfillmentReceipt`
   — Solana's `init` constraint is atomic per-PDA, so a second concurrent
   request reusing the same signature fails outright, same guarantee that
   already protected against `resourceId` reuse. This is the real fix for
   the TOCTOU race; the off-chain scan is kept only as a fast, friendly
   pre-check, not the actual defense anymore.
   (`payment_signature_hash` is caller-supplied and independently
   re-verified on-chain against `hash(payment_signature)` — a 64-byte
   signature exceeds Solana's 32-byte seed limit, and Anchor's IDL-build
   macro can't evaluate a `hash()` call inline inside `seeds`, so the hash
   is computed in TS and checked in the handler instead of the accounts
   macro.)

Replacing the "pay externally, paste the signature back" flow with an
in-browser wallet-signed transaction (`@solana/kit` + the wallet-standard
plumbing already used by the vault demo, not `@solana/wallet-adapter-react`
— that library isn't in this codebase at all) was a deliberate reversal of
the Fase 3 decision to skip wallet integration; keeping the old paste-in
flow as a fallback for advanced/CLI users would have left the memo
requirement effectively unenforceable for them (nothing stops them typing
in a real signature that has no memo), so a "manual entry" mode is kept
only as a visibly separate, clearly optional path, not the default.

## 2026-09-15 — Fase 3 frontend: no wallet-adapter, paste-signature flow (later reversed — see 2026-09-17 above)

Built attesto.xyz's real product page (hero → how it works → live activity
→ Try it → API reference → legal) on the same structure Vouch402 already
proves in production. For "Try it," chose not to add wallet-adapter
integration: the flow asked the user to pay the quoted amount from any
wallet or CLI they already controlled, then paste the confirmed
transaction signature back into the page. Simpler to ship for a hackathon
deadline, and Vouch402's own production pattern doesn't require an
in-page wallet connection either.

Two real bugs found and fixed while building and testing this, not just
typechecked:

- `next build`'s real TypeScript check (never run before — `next dev`
  transpiles without it) was failing on a pre-existing type error in
  `attesto-program.ts`: passing `receipt` and `systemProgram` into
  `.accounts()` when Anchor's typed client already auto-resolves both from
  the IDL. Removed both, kept only `issuer` (the one actual signer).
  Confirmed against the IDL before changing it, re-verified against real
  devnet after.
- Driving the Try It flow end-to-end with a garbled payment signature
  surfaced an unhandled exception in the skill-check route: a malformed
  signature reached `getProgramAccounts`' memcmp filter and threw,
  producing a raw 500 instead of a usable error. Added base58 + 64-byte
  validation up front, returns a clean 400.

Verified in a real headless browser (Playwright): desktop and mobile
layouts, live metrics loading real numbers, and the full
quote → checkbox → paste-signature → error-recovery path clicked through
end to end.

**This decision (no wallet-adapter) was reversed two days later** once a
security review found that the paste-signature flow had no way to bind a
payment to the specific request it was meant to pay for — see the
2026-09-17 entry above for why, and what replaced it.

## 2026-09-15 — Disputes and metrics stay fully non-custodial and DB-free too

`POST /v1/disputes` doesn't file a dispute on the caller's behalf — it
can't, `file_dispute` requires `disputer.key() == receipt.payer`, so only
the original payer's own wallet can sign it. The endpoint's actual job is
narrower and honest about it: the disputer signs and submits
`file_dispute` themselves, directly on devnet, then POSTs the resulting
`{resourceId, signature}` here. The route verifies the transaction
succeeded and actually touched this resourceId's dispute PDA, then reads
back and returns the resulting on-chain record. Same trust shape as the
payment flow (client acts on-chain first, server verifies after) —
consistent on purpose, not two different mental models in the same repo.

`GET /v1/metrics` is computed live from `getProgramAccounts` on every
request (discriminator-filtered for `FulfillmentReceipt` and `Dispute`,
counts and unique payers derived from what's actually returned) — no
counters cached in a database that could drift from on-chain reality.
Cheap enough at hackathon scale; revisit if/when receipt count grows
large enough that a full scan on every metrics request stops being free.

## 2026-09-15 — Two-layer replay protection, both on-chain, no side database

`record_fulfillment_attestation` and `file_dispute` both need to reject
reuse: the same `resourceId` used twice, and the same payment transaction
signature backing two different `resourceId`s (the second is the more
important one — the first is already free from PDA `init`, the second
would otherwise let one payment fund unlimited attestations).

Chose to close both on-chain rather than adding a database:
- Same `resourceId` twice → the `FulfillmentReceipt` PDA's `init` fails
  outright if the account already exists. No code needed, it's a Solana
  runtime guarantee.
- Same payment signature under a different `resourceId` → a
  `getProgramAccounts` call with a `memcmp` filter on the receipt's stored
  `payment_signature` field, run before minting. No index to maintain,
  and anyone can run the same check independently — it's not a private
  server-side guard.

Why not a database: introducing one is real ongoing infrastructure for a
4-week build, and every extra piece of private server state to trust is
one more thing standing between "Attesto says so" and "verify it
yourself" — which is the entire pitch. `getProgramAccounts` at this scale
(dozens–hundreds of receipts during the hackathon) is fast enough that
there's no real tradeoff yet.

## 2026-09-15 — resourceId is a stateless, HMAC-signed token, not a stored challenge

The 402 response needs to hand out a `resourceId` the server can later
trust on retry. The obvious approach — store a pending-challenge row
keyed by a random id — was rejected: it's exactly the kind of per-client
state `mexico-legal-check` says to avoid (Test 1, IFPE — nothing that
looks like an accumulating balance or a standing relationship per
client). Instead the `resourceId` **is** the challenge: a JSON payload
(checked address, price, pay-to, mint, expiry, nonce) plus an HMAC-SHA256
tag, both base64url-encoded. The server verifies the tag and expiry on
retry with no lookup. Nothing is written until the request is actually
fulfilled.

## 2026-09-15 — Payment verified directly against RPC, no x402 facilitator

Researched the existing x402-Solana ecosystem before writing anything
(PayAI Network's `x402-solana` npm package, the official
`create-solana-dapp` `x402-template`). Both delegate settlement to a
remote facilitator: the client signs but does not broadcast a
transaction, and the facilitator broadcasts and reports back "settled."

Rejected that model for Attesto. Two reasons:
1. It reintroduces exactly the kind of trusted third party Vouch402 (the
   production predecessor this pipeline is forked from) already proved
   unnecessary — Vouch402 verifies confirmed transactions directly against
   RPC, no facilitator, and that's the pattern this hackathon submission
   discloses as prior art.
2. Routing settlement through a third-party facilitator edges toward the
   "infrastructure that connects/reconciles/matches another party's
   operation" role `mexico-legal-check` flags as a red line. Verifying a
   transaction the payer already confirmed themselves is not that;
   settling payment through an intermediary might be.

So: the client broadcasts and confirms the SPL transfer themselves, then
hands the server the confirmed signature. The server reads the
transaction straight off RPC (`getParsedTransaction`) and checks the
`transferChecked` instruction itself — destination, mint, amount, all
verified locally, nothing taken on a facilitator's word.

## 2026-09-15 — attesto_program is a separate program from prova_program

Discussed explicitly with the user before writing any Rust: extend
Prova's actual deployed program (same Program ID, same upgrade authority)
vs. fork the pattern into a new program with its own devnet address.
Decided on the fork (see the two options weighed — separate program with
Prova's pattern reused was the recommendation, user confirmed it).

Reasoning: Prova is a separate, already-shipped product with its own
users and its own devnet state. Attesto reads Prova's real attestation
data (that's the actual product value — verifying a genuine external
registry, not inventing one), but *writing* Attesto-specific records
(fulfillment receipts, disputes) into Prova's program would couple two
independent products' upgrade cycles and account namespaces for no
benefit. "Extend prova_program, don't build a new mechanism from
scratch" is honored at the level of the *pattern* (PDA + `emit!`, same
account-layout conventions) rather than literally the same deployed
bytecode.

## 2026-09-15 — New instructions avoid Ed25519 signature verification entirely

Read `prova_program`'s `record_attestations.rs` before designing anything
new, specifically to check the known finding: no protection against
Ed25519 signature reuse. Confirmed in the code itself — intra-batch reuse
*is* closed (a `HashSet` on `action_hash` within one transaction), but
the same instruction's own comment states cross-transaction replay is
still open, roadmapped post-M7.

Rather than reimplement Prova's Ed25519-verification path and inherit
that open question, Attesto's two instructions don't verify Ed25519
signatures at all — there's no "prove you're the agent" signature check
on-chain to replay. The thing being protected against reuse is the
*payment*, not a signed message, and that's handled by the two on-chain
mechanisms above (PDA `init` + `memcmp` scan). This isn't a fix to
Prova's open item — it's a different design that doesn't have the
vulnerable surface in the first place.

## 2026-09-15 — Separate keys for upgrade authority, issuer, and treasury

Three devnet keypairs, three jobs, deliberately not collapsed into one:
- `attesto-deployer` — program upgrade authority only.
- `attesto-issuer` — the only signer `record_fulfillment_attestation` and
  `file_dispute` accept; this is the key the running backend holds and
  uses on every request.
- `attesto-treasury` — holds the USDC token account payments land in.

If the issuer key (the one exposed to a running server process) is ever
compromised, it can mint fraudulent-looking receipts but can't upgrade
the program or move treasury funds. This is the standard blast-radius
argument for key separation, applied because the issuer key is the one
with actual network exposure.

## 2026-09-15 — Scoring formula, v1

`volume` (0–50, `min(attestation_count, 20) / 20 * 50`) + `recency`
(0–30, full marks within 30 days of the last attestation, linear decay to
0 by 180 days) + `diversity` (0–20, distinct `action_type`s seen in the
most recent 25 attestations, out of 7 possible, `/7 * 20`). A revoked
Prova agent scores 0 regardless of history. Documented here (and returned
as a `breakdown` in the API response) so the number is auditable, not a
black box — matches the "resolvable independently" premise of the whole
product. Expect this to be revisited once there's real usage data; it's a
defensible v1, not a claimed-final formula.
