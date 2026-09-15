use anchor_lang::prelude::*;
use crate::errors::AttestoError;
use crate::state::{Dispute, FulfillmentReceipt};

#[derive(Accounts)]
#[instruction(resource_id: [u8; 32], reason: String)]
pub struct FileDispute<'info> {
    #[account(
        mut,
        seeds = [FulfillmentReceipt::SEED, resource_id.as_ref()],
        bump = receipt.bump,
        constraint = !receipt.disputed @ AttestoError::AlreadyDisputed,
        constraint = disputer.key() == receipt.payer @ AttestoError::UnauthorizedDisputer
    )]
    pub receipt: Account<'info, FulfillmentReceipt>,

    #[account(
        init,
        payer = disputer,
        space = Dispute::LEN,
        seeds = [Dispute::SEED, resource_id.as_ref()],
        bump
    )]
    pub dispute: Account<'info, Dispute>,

    #[account(mut)]
    pub disputer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<FileDispute>,
    resource_id: [u8; 32],
    reason: String,
) -> Result<()> {
    require!(reason.len() <= 200, AttestoError::ReasonTooLong);

    let receipt = &mut ctx.accounts.receipt;
    let dispute = &mut ctx.accounts.dispute;
    let clock = Clock::get()?;

    receipt.disputed = true;

    dispute.resource_id = resource_id;
    dispute.receipt = receipt.key();
    dispute.disputer = ctx.accounts.disputer.key();
    dispute.reason = reason.clone();
    dispute.created_at = clock.unix_timestamp;
    dispute.bump = ctx.bumps.dispute;

    emit!(DisputeFiled {
        dispute: dispute.key(),
        receipt: receipt.key(),
        resource_id,
        disputer: dispute.disputer,
        reason,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct DisputeFiled {
    pub dispute: Pubkey,
    pub receipt: Pubkey,
    pub resource_id: [u8; 32],
    pub disputer: Pubkey,
    pub reason: String,
    pub timestamp: i64,
}
