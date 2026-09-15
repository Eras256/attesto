import { PublicKey } from "@solana/web3.js";

/**
 * Account discriminators as generated into the IDL by `anchor build`
 * (`app/lib/server/idl/attesto_program.json`, `accounts[].discriminator`) —
 * copied from there, not recomputed by hand, to avoid a transcription bug.
 */
export const FULFILLMENT_RECEIPT_DISCRIMINATOR = Buffer.from([
  175, 44, 33, 15, 243, 114, 23, 50,
]);
export const DISPUTE_DISCRIMINATOR = Buffer.from([
  36, 49, 241, 67, 40, 36, 241, 74,
]);

export interface DecodedFulfillmentReceipt {
  resourceId: Buffer;
  payer: PublicKey;
  checkedAddress: PublicKey;
  score: number;
  paymentSignature: Buffer;
  createdAt: number;
  disputed: boolean;
  bump: number;
}

/** Layout: 8 (disc) + resource_id(32) + payer(32) + checked_address(32) + score(1) + payment_signature(64) + created_at(8) + disputed(1) + bump(1). */
export function decodeFulfillmentReceipt(data: Buffer): DecodedFulfillmentReceipt {
  let o = 8;
  const resourceId = data.subarray(o, o + 32);
  o += 32;
  const payer = new PublicKey(data.subarray(o, o + 32));
  o += 32;
  const checkedAddress = new PublicKey(data.subarray(o, o + 32));
  o += 32;
  const score = data[o];
  o += 1;
  const paymentSignature = data.subarray(o, o + 64);
  o += 64;
  const createdAt = Number(data.readBigInt64LE(o));
  o += 8;
  const disputed = data[o] !== 0;
  o += 1;
  const bump = data[o];

  return { resourceId, payer, checkedAddress, score, paymentSignature, createdAt, disputed, bump };
}

export interface DecodedDispute {
  resourceId: Buffer;
  receipt: PublicKey;
  disputer: PublicKey;
  reason: string;
  createdAt: number;
  bump: number;
}

/** Layout: 8 (disc) + resource_id(32) + receipt(32) + disputer(32) + reason(4-byte len prefix + utf8) + created_at(8) + bump(1). */
export function decodeDispute(data: Buffer): DecodedDispute {
  let o = 8;
  const resourceId = data.subarray(o, o + 32);
  o += 32;
  const receipt = new PublicKey(data.subarray(o, o + 32));
  o += 32;
  const disputer = new PublicKey(data.subarray(o, o + 32));
  o += 32;
  const reasonLen = data.readUInt32LE(o);
  o += 4;
  const reason = data.subarray(o, o + reasonLen).toString("utf-8");
  o += reasonLen;
  const createdAt = Number(data.readBigInt64LE(o));
  o += 8;
  const bump = data[o];

  return { resourceId, receipt, disputer, reason, createdAt, bump };
}
