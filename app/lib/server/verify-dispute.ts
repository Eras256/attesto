import { getConnection } from "./attesto-program";
import { ATTESTO_PROGRAM_ID } from "./config";

export type VerifyDisputeTxResult =
  | { ok: true; blockTime: number }
  | { ok: false; error: string };

/**
 * The disputer signs and submits `file_dispute` themselves, directly
 * on-chain — Attesto never holds their key and never files on their
 * behalf, same non-custodial shape as the payment flow. This just
 * confirms the transaction they're pointing at actually succeeded and
 * actually touched attesto_program's dispute PDA for this resourceId,
 * before the route trusts the resulting account state.
 */
export async function verifyDisputeTransaction(
  signature: string,
  disputePda: string,
): Promise<VerifyDisputeTxResult> {
  const connection = getConnection();

  let tx;
  try {
    tx = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  } catch {
    return { ok: false, error: "failed to fetch dispute transaction" };
  }

  if (!tx) return { ok: false, error: "dispute transaction not found or not yet confirmed" };
  if (tx.meta?.err) return { ok: false, error: "dispute transaction failed on-chain" };

  const accountKeys = tx.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
  const touchesProgram = accountKeys.includes(ATTESTO_PROGRAM_ID.toBase58());
  const touchesDispute = accountKeys.includes(disputePda);

  if (!touchesProgram || !touchesDispute) {
    return {
      ok: false,
      error: "this transaction doesn't invoke attesto_program's file_dispute for this resourceId",
    };
  }

  return { ok: true, blockTime: tx.blockTime ?? Math.floor(Date.now() / 1000) };
}
