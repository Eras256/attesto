import { PublicKey, type TransactionInstruction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { address, AccountRole, type Address, type Instruction } from "@solana/kit";

const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

// The app builds Attesto's payment instructions with @solana/spl-token
// (web3.js-typed, well-tested TransferChecked/ATA encoding) but sends them
// through @solana/kit's useSendTransaction (the wallet-standard signer this
// app already uses elsewhere). The two libraries' Instruction shapes are
// structurally equivalent — this just relabels one as the other.
function toKitInstruction(ix: TransactionInstruction): Instruction {
  return {
    programAddress: address(ix.programId.toBase58()),
    accounts: ix.keys.map((k) => ({
      address: address(k.pubkey.toBase58()),
      role: k.isSigner
        ? k.isWritable
          ? AccountRole.WRITABLE_SIGNER
          : AccountRole.READONLY_SIGNER
        : k.isWritable
          ? AccountRole.WRITABLE
          : AccountRole.READONLY,
    })),
    data: new Uint8Array(ix.data),
  };
}

function memoInstruction(signer: Address, memo: string): Instruction {
  return {
    programAddress: address(MEMO_PROGRAM_ID),
    accounts: [{ address: signer, role: AccountRole.READONLY_SIGNER }],
    data: new TextEncoder().encode(memo),
  };
}

export interface BuildPaymentParams {
  payerAddress: Address;
  payTo: string;
  mint: string;
  amountAtomic: string;
  decimals: number;
  /** The exact resourceId token from the 402 response — becomes the memo. */
  resourceId: string;
}

/**
 * Builds [create-ATA-if-needed, transferChecked, memo] as @solana/kit
 * instructions for the x402 payment. The memo is what verify-payment.ts
 * checks server-side to bind this exact payment to this exact resourceId —
 * see the comment above verifyPaymentTransaction in
 * app/lib/server/verify-payment.ts for why that binding matters.
 */
export function buildAttestoPaymentInstructions(
  params: BuildPaymentParams,
): Instruction[] {
  const owner = new PublicKey(params.payerAddress);
  const mint = new PublicKey(params.mint);
  const destination = new PublicKey(params.payTo);
  const source = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID);

  const createSourceAtaIx = createAssociatedTokenAccountIdempotentInstruction(
    owner,
    source,
    owner,
    mint,
    TOKEN_PROGRAM_ID,
  );

  const transferIx = createTransferCheckedInstruction(
    source,
    mint,
    destination,
    owner,
    BigInt(params.amountAtomic),
    params.decimals,
    [],
    TOKEN_PROGRAM_ID,
  );

  return [
    toKitInstruction(createSourceAtaIx),
    toKitInstruction(transferIx),
    memoInstruction(params.payerAddress, params.resourceId),
  ];
}
