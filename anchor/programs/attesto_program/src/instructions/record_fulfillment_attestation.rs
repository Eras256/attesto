use anchor_lang::prelude::*;
use crate::errors::AttestoError;
use crate::state::FulfillmentReceipt;

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
#[instruction(resource_id: [u8; 32])]
pub struct RecordFulfillmentAttestation<'info> {
    #[account(
        init,
        payer = issuer,
        space = FulfillmentReceipt::LEN,
        seeds = [FulfillmentReceipt::SEED, resource_id.as_ref()],
        bump
    )]
    pub receipt: Account<'info, FulfillmentReceipt>,

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
) -> Result<()> {
    require!(score <= 100, AttestoError::InvalidScore);

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
