import bs58 from "bs58";
import { getConnection } from "./attesto-program";
import { ATTESTO_PROGRAM_ID, PRICE_ATOMIC, USDC_DECIMALS } from "./config";
import {
  DISPUTE_DISCRIMINATOR,
  FULFILLMENT_RECEIPT_DISCRIMINATOR,
  decodeFulfillmentReceipt,
} from "./decode-accounts";

export interface AttestoMetrics {
  network: string;
  program: string;
  uniquePayers: number;
  requestsServed: number;
  attestations: number;
  disputes: number;
  volumeAtomic: string;
  volumeUsdc: string;
  asOf: string;
}

/**
 * Every counter here is read straight off devnet — no private database of
 * "requests served" that could drift from what's actually on-chain and
 * resolvable by anyone else. Cheap at hackathon scale (getProgramAccounts
 * with a discriminator filter, no full-data fetch where a count suffices).
 */
export async function computeMetrics(): Promise<AttestoMetrics> {
  const connection = getConnection();

  const [receiptAccounts, disputeAccounts] = await Promise.all([
    connection.getProgramAccounts(ATTESTO_PROGRAM_ID, {
      filters: [
        { memcmp: { offset: 0, bytes: bs58.encode(FULFILLMENT_RECEIPT_DISCRIMINATOR) } },
      ],
    }),
    connection.getProgramAccounts(ATTESTO_PROGRAM_ID, {
      dataSlice: { offset: 0, length: 0 },
      filters: [
        { memcmp: { offset: 0, bytes: bs58.encode(DISPUTE_DISCRIMINATOR) } },
      ],
    }),
  ]);

  const uniquePayers = new Set<string>();
  for (const { account } of receiptAccounts) {
    const decoded = decodeFulfillmentReceipt(account.data);
    uniquePayers.add(decoded.payer.toBase58());
  }

  const requestsServed = receiptAccounts.length;
  const volumeAtomic = PRICE_ATOMIC * BigInt(requestsServed);
  const volumeUsdc = (Number(volumeAtomic) / 10 ** USDC_DECIMALS).toFixed(USDC_DECIMALS);

  return {
    network: "solana-devnet",
    program: ATTESTO_PROGRAM_ID.toBase58(),
    uniquePayers: uniquePayers.size,
    requestsServed,
    attestations: requestsServed,
    disputes: disputeAccounts.length,
    volumeAtomic: volumeAtomic.toString(),
    volumeUsdc,
    asOf: new Date().toISOString(),
  };
}
