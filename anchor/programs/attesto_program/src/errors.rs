use anchor_lang::prelude::*;

#[error_code]
pub enum AttestoError {
    #[msg("Caller is not the authorized Attesto issuer")]
    UnauthorizedIssuer,
    #[msg("Score must be between 0 and 100")]
    InvalidScore,
    #[msg("Caller is not the original payer of this receipt")]
    UnauthorizedDisputer,
    #[msg("This receipt has already been disputed")]
    AlreadyDisputed,
    #[msg("Dispute reason exceeds 200 bytes")]
    ReasonTooLong,
    #[msg("payment_signature_hash does not match SHA-256(payment_signature)")]
    PaymentHashMismatch,
}
