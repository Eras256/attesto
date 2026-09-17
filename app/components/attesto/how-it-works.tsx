const STEPS = [
  {
    title: "Request without paying",
    body: "Call GET /v1/skill-check/:address with no payment. Attesto answers with a 402 and the exact price, in USDC, down to the cent.",
  },
  {
    title: "Pay directly on-chain",
    body: "Send the quoted USDC straight to the given address with a transferChecked instruction, plus a memo binding the payment to this exact request — no facilitator sits in between.",
  },
  {
    title: "Retry with your proof",
    body: "Call the same request again, this time with the confirmed transaction signature attached as proof of payment.",
  },
  {
    title: "Verified before anything ships",
    body: "Attesto reads the transaction straight off Solana RPC and checks the destination, mint, and amount itself before releasing a result.",
  },
  {
    title: "Attestation minted automatically",
    body: "A proof-of-fulfillment record is written on-chain the moment the check is served — resolvable independently, not just taken on Attesto's word.",
  },
  {
    title: "Disputable, on-chain",
    body: "The original payer can sign and file a dispute themselves; Attesto verifies it happened and surfaces the resulting on-chain record.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 md:py-20">
      <div className="mb-10 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <p className="max-w-2xl text-foreground/60">
          Six steps, entirely on-chain — no server-side balance, no intermediary
          settling on Attesto&apos;s behalf.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex flex-col gap-3 rounded-2xl border border-border-low bg-card p-5"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-cream font-mono text-sm font-semibold text-foreground/70">
              {i + 1}
            </span>
            <h3 className="text-base font-semibold">{step.title}</h3>
            <p className="text-sm leading-relaxed text-foreground/60">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
