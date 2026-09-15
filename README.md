# Attesto

An x402-metered oracle on Solana: an AI agent pays cents in USDC to verify
whether an address has a real, on-chain skill credential behind it —
sourced from [Prova](https://theprova.xyz)'s attestation registry — before
hiring or transacting with it. Every paid check mints its own
proof-of-fulfillment attestation on-chain, independently resolvable
without trusting this server.

Reuses the pipeline shape already validated in production by
[Vouch402](https://vouch402.xyz) (Base/EVM, live): quote → pay directly
on-chain → verify → attest → dispute. The data sold (a skill credential,
not a wallet risk-score) and the attestation engine (Solana/Anchor, not
EAS) are new for this product.

**Attesto is not a rename of Prova — they're two separate products by the
same team.** Prova (`theprova.xyz`, separate repo, separate deployed
program) is a general-purpose AI-agent behavior attestation service.
Attesto is a new, distinct product that *reads* Prova's real on-chain
attestation data as one input to its own paid skill-check score, and
writes its own attestations to its own program (`attesto_program`,
separate Program ID — see "What's deployed right now" below). See
`DECISIONS.md` ("attesto_program is a separate program from
prova_program") for why that separation was kept even though the two are
related.

Built for Crypto World's Fair (Colosseum), Solana track.

## Status

- **Fase 0** (bootstrap) — done.
- **Fase 1** (pay → verify → attest loop) — done. `GET /v1/skill-check/:address`
  is live against real devnet, x402 flow included.
- **Fase 2** (disputes + metrics) — in progress.
- **Fase 3** (attesto.xyz frontend) — not started.

See `DECISIONS.md` for the architecture calls behind this and why.

## What's deployed right now

- `attesto_program` (Anchor, Solana devnet): `EgLkDDxhS1Cd61VjJzMSURC1zko3xtbcAexQqyGBqvdk`
  — a program of its own, separate from Prova's live `prova_program`
  (`G11dBAzLQaADtHHM2AZNz3ThCDnkY5nhX3Ujddu1CMM1`), which Attesto only
  *reads* from for scoring. Two instructions: `record_fulfillment_attestation`
  and `file_dispute`. See `anchor/programs/attesto_program/src`.
- `GET /v1/skill-check/:address` (Next.js route handler, `app/v1/skill-check/[address]/route.ts`):
  full x402 402-then-retry flow, payment verified directly against RPC (no
  facilitator), score derived from Prova's real on-chain attestation data.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in ATTESTO_ISSUER_KEYPAIR_PATH and ATTESTO_HMAC_SECRET
npm run dev
```

`GET http://localhost:3000/v1/skill-check/<any base58 pubkey>` with no
payment header returns a 402 with a `resourceId` and payment instructions.
Pay the quoted amount of devnet USDC to the `payTo` address with a
`transferChecked` instruction, then retry the same request with header
`X-PAYMENT: base64({x402Version,scheme,network,payload:{resourceId,signature}})`.

## Anchor program

```bash
cd anchor
anchor build
anchor deploy --provider.cluster devnet --provider.wallet <path-to-upgrade-authority>
```

Toolchain is pinned to `anchor-lang`/`solana_version` 0.31.0 to match
`prova_program` and the installed `anchor-cli`. See the comments in
`anchor/programs/attesto_program/Cargo.toml` for the transitive-dependency
pins this requires (several crates ship editions the SBF toolchain's
bundled rustc can't build).

If you touch the program, regenerate the copy of the IDL the backend reads
from (`anchor/target/` is gitignored, so this copy is what actually ships):

```bash
cp anchor/target/idl/attesto_program.json app/lib/server/idl/attesto_program.json
cp anchor/target/types/attesto_program.ts app/lib/server/idl/attesto_program.ts
```

## Legal posture

Attesto never accumulates a per-client balance and never intermediates an
exchange of assets — every request settles atomically and Attesto is paid
only for its own computation (the score). Keep it that way; see
`.claude/skills/mexico-legal-check/SKILL.md` before changing anything about
how payment or settlement works, and avoid "wallet/exchange/custody/broker/
intermediary/matching engine/deposit/balance" in product copy per that
skill's guidance.
