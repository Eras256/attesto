import { readFileSync } from "fs";
import { Keypair, PublicKey } from "@solana/web3.js";

/**
 * Server-only config. Never import this from a client component — it reads
 * the issuer keypair and the HMAC secret that signs resourceId tokens.
 */

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const RPC_URL =
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export const ATTESTO_PROGRAM_ID = new PublicKey(
  process.env.ATTESTO_PROGRAM_ID ?? "EgLkDDxhS1Cd61VjJzMSURC1zko3xtbcAexQqyGBqvdk",
);

export const PROVA_PROGRAM_ID = new PublicKey(
  process.env.PROVA_PROGRAM_ID ?? "G11dBAzLQaADtHHM2AZNz3ThCDnkY5nhX3Ujddu1CMM1",
);

// Devnet USDC (SPL Token program, 6 decimals) — verified live on devnet via RPC
// getAccountInfo before hardcoding. Same mint referenced by the x402-solana
// ecosystem's devnet config.
export const USDC_MINT = new PublicKey(
  process.env.ATTESTO_USDC_MINT ?? "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
);
export const USDC_DECIMALS = 6;

// The associated token account that receives payment — NOT a general-purpose
// "Attesto wallet". Attesto never holds a per-client balance; every request
// settles here atomically and is attested immediately. See mexico-legal-check.
export const TREASURY_ATA = new PublicKey(
  process.env.ATTESTO_TREASURY_ATA ?? "9jFjRSwN7zchM83LDLHugcDmGKe3fJ7MKaZPZVb8VYvh",
);

// 0.01 USDC per skill-check, in base units (6 decimals).
export const PRICE_ATOMIC = BigInt(process.env.ATTESTO_PRICE_ATOMIC ?? "10000");

export const CHALLENGE_TTL_SECONDS = 300;

let cachedIssuer: Keypair | null = null;

/** The only signer allowed to mint a FulfillmentReceipt on-chain. */
export function getIssuerKeypair(): Keypair {
  if (cachedIssuer) return cachedIssuer;

  const inlineSecret = process.env.ATTESTO_ISSUER_SECRET_KEY;
  if (inlineSecret) {
    const bytes = Uint8Array.from(JSON.parse(inlineSecret));
    cachedIssuer = Keypair.fromSecretKey(bytes);
    return cachedIssuer;
  }

  const keypairPath = requireEnv("ATTESTO_ISSUER_KEYPAIR_PATH");
  const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf-8")));
  cachedIssuer = Keypair.fromSecretKey(bytes);
  return cachedIssuer;
}

export function getHmacSecret(): string {
  return requireEnv("ATTESTO_HMAC_SECRET");
}
