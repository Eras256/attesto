import { PublicKey, ParsedInstruction, PartiallyDecodedInstruction } from "@solana/web3.js";
import { getConnection } from "./attesto-program";
import { PRICE_ATOMIC, TREASURY_ATA, USDC_DECIMALS, USDC_MINT } from "./config";

export interface VerifiedPayment {
  payer: PublicKey;
  blockTime: number;
}

export type VerifyResult =
  | { ok: true; payment: VerifiedPayment }
  | { ok: false; error: string };

function isParsed(
  ix: ParsedInstruction | PartiallyDecodedInstruction,
): ix is ParsedInstruction {
  return "parsed" in ix;
}

/**
 * Verifies a payment the way Vouch402 already does in production: read the
 * confirmed transaction straight off RPC and check it ourselves. No
 * facilitator, no trusting a third party's "it settled" response — the
 * payer already broadcast and confirmed this on-chain before ever showing
 * up here.
 */
export async function verifyPaymentTransaction(
  signature: string,
  expiresAt: number,
): Promise<VerifyResult> {
  const connection = getConnection();

  let tx;
  try {
    tx = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  } catch {
    return { ok: false, error: "failed to fetch payment transaction" };
  }

  if (!tx) return { ok: false, error: "payment transaction not found or not yet confirmed" };
  if (tx.meta?.err) return { ok: false, error: "payment transaction failed on-chain" };
  if (tx.blockTime && tx.blockTime > expiresAt) {
    return { ok: false, error: "payment happened after the resourceId expired" };
  }

  const allInstructions: (ParsedInstruction | PartiallyDecodedInstruction)[] = [
    ...tx.transaction.message.instructions,
    ...(tx.meta?.innerInstructions?.flatMap((i) => i.instructions) ?? []),
  ];

  for (const ix of allInstructions) {
    if (!isParsed(ix)) continue;
    if (ix.program !== "spl-token") continue;
    if (ix.parsed?.type !== "transferChecked") continue;

    const info = ix.parsed.info;
    if (info.destination !== TREASURY_ATA.toBase58()) continue;
    if (info.mint !== USDC_MINT.toBase58()) continue;
    if (info.tokenAmount?.decimals !== USDC_DECIMALS) continue;
    if (info.tokenAmount?.amount !== PRICE_ATOMIC.toString()) continue;

    const authority = info.authority ?? info.multisigAuthority;
    if (!authority) continue;

    return {
      ok: true,
      payment: {
        payer: new PublicKey(authority),
        blockTime: tx.blockTime ?? Math.floor(Date.now() / 1000),
      },
    };
  }

  return {
    ok: false,
    error: `no matching USDC transferChecked of ${PRICE_ATOMIC} base units to ${TREASURY_ATA.toBase58()} found in this transaction`,
  };
}
