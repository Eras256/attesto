use anchor_lang::prelude::*;

/// One paid GET /v1/skill-check request, settled and attested on-chain.
///
/// The `resource_id` seed is what makes replay impossible: Anchor's `init`
/// constraint fails outright if this PDA already exists, so the same
/// single-use resource_id issued in a 402 challenge can back at most one
/// attestation, full stop — no signature-reuse window like the one
/// documented in prova_program's record_attestations (that gap is about
/// Ed25519 message replay across transactions; this account never verifies
/// an Ed25519 signature at all, it just refuses to be created twice).
#[account]
#[derive(InitSpace)]
pub struct FulfillmentReceipt {
    pub resource_id: [u8; 32],
    pub payer: Pubkey,
    pub checked_address: Pubkey,
    pub score: u8,
    pub payment_signature: [u8; 64],
    pub created_at: i64,
    pub disputed: bool,
    pub bump: u8,
}

impl FulfillmentReceipt {
    pub const LEN: usize = 8 + Self::INIT_SPACE;
    pub const SEED: &'static [u8] = b"attesto_receipt";
}
