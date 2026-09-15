use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("EgLkDDxhS1Cd61VjJzMSURC1zko3xtbcAexQqyGBqvdk");

#[program]
pub mod attesto_program {
    use super::*;

    /// Called by Attesto's server after it has independently verified, by
    /// reading the transaction straight off devnet RPC, that `payment_signature`
    /// is a confirmed SPL transfer of the exact quoted amount from `payer` to
    /// Attesto's receiving address. Mints a permanent, publicly resolvable
    /// receipt of what was returned for a given paid request.
    pub fn record_fulfillment_attestation(
        ctx: Context<RecordFulfillmentAttestation>,
        resource_id: [u8; 32],
        payer: Pubkey,
        checked_address: Pubkey,
        score: u8,
        payment_signature: [u8; 64],
    ) -> Result<()> {
        instructions::record_fulfillment_attestation::handler(
            ctx,
            resource_id,
            payer,
            checked_address,
            score,
            payment_signature,
        )
    }

    /// Called by whoever paid for a skill-check, to dispute the fulfillment
    /// receipt they received. One dispute per resource_id, enforced by PDA
    /// `init` — no separate nonce bookkeeping needed.
    pub fn file_dispute(
        ctx: Context<FileDispute>,
        resource_id: [u8; 32],
        reason: String,
    ) -> Result<()> {
        instructions::file_dispute::handler(ctx, resource_id, reason)
    }
}
