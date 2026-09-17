use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;
use crate::errors::AttestoError;
use crate::state::{FulfillmentReceipt, PaymentMarker};

/// Pubkey of Attesto's dedicated issuer keypair — the only signer allowed to
/// mint a fulfillment receipt. Deliberately separate from the program's
/// upgrade authority (attesto-deployer): this key only ever signs day-to-day
/// attestation writes, so a compromise doesn't hand over upgrade power, and
/// the upgrade authority never needs to touch day-to-day traffic.
///
/// Hardcoded as a compile-time constant for v1 — rotating it means a program
/// upgrade, not a config transaction. Fine for a hackathon-scoped launch;
/// the two-instruction spec for this program didn't call for a third
/// "set_issuer" instruction, so this is the deliberately simpler option.
pub const ISSUER_PUBKEY: Pubkey = anchor_lang::solana_program::pubkey!(
    "7NbpyTW6E9VgHh6bymKogVxub7ujB3yego3bcyLFT73Y"
);

#[derive(Accounts)]
#[instruction(resource_id: [u8; 32], payer: Pubkey, checked_address: Pubkey, score: u8, payment_signature: [u8; 64], payment_signature_hash: [u8; 32])]
pub struct RecordFulfillmentAttestation<'info> {
    #[account(
        init,
        payer = issuer,
        space = FulfillmentReceipt::LEN,
        seeds = [FulfillmentReceipt::SEED, resource_id.as_ref()],
        bump
    )]
    pub receipt: Account<'info, FulfillmentReceipt>,

    /// Guards against one payment_signature backing more than one receipt.
    /// Seeded on payment_signature_hash (the caller-supplied SHA-256 of
    /// payment_signature — 64 bytes exceeds the 32-byte seed limit, and
    /// Anchor's IDL-build macro can't evaluate a hash() call inline in
    /// `seeds`, hence precomputing it) and `init`'d in this same instruction,
    /// so a second concurrent request reusing the same signature fails
    /// atomically here — see PaymentMarker's doc comment for why this
    /// replaces the old off-chain getProgramAccounts scan. The handler
    /// re-derives the hash itself and rejects a mismatch, so a caller can't
    /// desync the seed from the actual signature being recorded.
    #[account(
        init,
        payer = issuer,
        space = PaymentMarker::LEN,
        seeds = [PaymentMarker::SEED, payment_signature_hash.as_ref()],
        bump
    )]
    pub payment_marker: Account<'info, PaymentMarker>,

    #[account(mut, constraint = issuer.key() == ISSUER_PUBKEY @ AttestoError::UnauthorizedIssuer)]
    pub issuer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RecordFulfillmentAttestation>,
    resource_id: [u8; 32],
    payer: Pubkey,
    checked_address: Pubkey,
    score: u8,
    payment_signature: [u8; 64],
    payment_signature_hash: [u8; 32],
) -> Result<()> {
    require!(score <= 100, AttestoError::InvalidScore);
    require!(
        hash(&payment_signature).to_bytes() == payment_signature_hash,
        AttestoError::PaymentHashMismatch
    );

    let receipt = &mut ctx.accounts.receipt;
    let clock = Clock::get()?;

    receipt.resource_id = resource_id;
    receipt.payer = payer;
    receipt.checked_address = checked_address;
    receipt.score = score;
    receipt.payment_signature = payment_signature;
    receipt.created_at = clock.unix_timestamp;
    receipt.disputed = false;
    receipt.bump = ctx.bumps.receipt;

    ctx.accounts.payment_marker.bump = ctx.bumps.payment_marker;

    emit!(FulfillmentAttested {
        receipt: receipt.key(),
        resource_id,
        payer,
        checked_address,
        score,
        payment_signature,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct FulfillmentAttested {
    pub receipt: Pubkey,
    pub resource_id: [u8; 32],
    pub payer: Pubkey,
    pub checked_address: Pubkey,
    pub score: u8,
    pub payment_signature: [u8; 64],
    pub timestamp: i64,
}
