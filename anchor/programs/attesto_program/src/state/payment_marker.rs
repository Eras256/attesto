use anchor_lang::prelude::*;

/// Marks one payment_signature as already spent, atomically alongside the
/// FulfillmentReceipt it backs. Seeded on hash(payment_signature) rather than
/// FulfillmentReceipt's own resource_id seed, so a single confirmed payment
/// can never back two different receipts even under concurrent requests: the
/// second `init` of this PDA fails outright, same atomicity guarantee that
/// already protects against resource_id reuse, closing the read-then-write
/// window the old off-chain getProgramAccounts scan (attesto-program.ts's
/// findReceiptByPaymentSignature) could not.
#[account]
#[derive(InitSpace)]
pub struct PaymentMarker {
    pub bump: u8,
}

impl PaymentMarker {
    pub const LEN: usize = 8 + Self::INIT_SPACE;
    pub const SEED: &'static [u8] = b"attesto_payment";
}
