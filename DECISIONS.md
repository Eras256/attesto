# Decisions

Architecture and security calls made while building Attesto, with the
reasoning behind them — so anyone reading this later (a judge, an
investor, a future contributor) can see there was real judgment behind the
code, not just code. Newest first.

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
