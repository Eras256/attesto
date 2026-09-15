# attesto_program

Anchor program backing Attesto's paid skill-check flow. Two instructions,
both `emit!`-based (no per-attestation PDA beyond the receipt itself),
same pattern Prova already runs in production for its own attestations.

## Deployed

Devnet: `EgLkDDxhS1Cd61VjJzMSURC1zko3xtbcAexQqyGBqvdk`

## Instructions

- **`record_fulfillment_attestation`** — called by Attesto's issuer key
  after the backend independently verifies a USDC payment on-chain. Mints
  a `FulfillmentReceipt` PDA seeded on the request's `resource_id`; `init`
  makes it un-replayable by construction.
- **`file_dispute`** — called by the original payer (must match the
  receipt's `payer` field) against one receipt. One dispute per
  `resource_id`, same PDA-`init` guarantee.

See `programs/attesto_program/src/instructions/*.rs` for the accounts and
handlers, and `programs/attesto_program/src/state/*.rs` for account layout.

## Building

```bash
anchor build
```

Toolchain is pinned to 0.31.0 (`Anchor.toml` `[toolchain]`, and
`anchor-lang`/`solana-program` in `programs/attesto_program/Cargo.toml`) to
match `prova_program` and the `anchor-cli` this was built against. Several
transitive deps (`zeroize`, `zeroize_derive`, `hashbrown`, `blake3`,
`proc-macro-crate`, `indexmap`, `unicode-segmentation`) are pinned in that
same `Cargo.toml` because newer releases require `edition2024`, which the
SBF toolchain's bundled rustc (1.79, shipped with Solana CLI 2.1) can't
build. If `anchor build` fails on a "feature edition2024 is required"
error for some other crate, pin it the same way.

## Deploying

```bash
anchor deploy --provider.cluster devnet --provider.wallet <path-to-upgrade-authority-keypair>
```

The upgrade authority is a dedicated `attesto-deployer` keypair, separate
from the `attesto-issuer` keypair that signs day-to-day
`record_fulfillment_attestation`/`file_dispute` calls (see `../README.md`
and `../DECISIONS.md`) — a compromised issuer key can't take over the
program, and the deploy key is never used for routine traffic.

After any change here, regenerate the IDL copy the backend actually reads
from (`target/` is gitignored):

```bash
cp target/idl/attesto_program.json ../app/lib/server/idl/attesto_program.json
cp target/types/attesto_program.ts ../app/lib/server/idl/attesto_program.ts
```
