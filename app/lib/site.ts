// Public, client-safe constants mirroring the defaults in
// app/lib/server/config.ts and .env.example. These are addresses anyone
// can already read off devnet — nothing here is a secret.

export const SITE_URL = "https://attesto.xyz";

export const ATTESTO_PROGRAM_ID =
  "EgLkDDxhS1Cd61VjJzMSURC1zko3xtbcAexQqyGBqvdk";
export const PROVA_PROGRAM_ID = "G11dBAzLQaADtHHM2AZNz3ThCDnkY5nhX3Ujddu1CMM1";
export const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
export const TREASURY_ATA = "9jFjRSwN7zchM83LDLHugcDmGKe3fJ7MKaZPZVb8VYvh";
export const PRICE_USDC = "0.01";
export const USDC_DECIMALS = 6;
export const NETWORK = "solana-devnet";

export const GITHUB_URL = "https://github.com/Eras256/attesto";

export function explorerUrl(path: string): string {
  return `https://explorer.solana.com${path}?cluster=devnet`;
}
