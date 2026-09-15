use anchor_lang::prelude::*;

/// A dispute filed by the original payer against one FulfillmentReceipt.
/// Same replay guarantee as the receipt itself: seeded on resource_id, so
/// `init` allows at most one dispute per paid request.
#[account]
#[derive(InitSpace)]
pub struct Dispute {
    pub resource_id: [u8; 32],
    pub receipt: Pubkey,
    pub disputer: Pubkey,
    #[max_len(200)]
    pub reason: String,
    pub created_at: i64,
    pub bump: u8,
}

impl Dispute {
    pub const LEN: usize = 8 + Self::INIT_SPACE;
    pub const SEED: &'static [u8] = b"attesto_dispute";
}
