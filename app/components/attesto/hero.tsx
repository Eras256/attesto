export function Hero() {
  return (
    <section className="pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border-low bg-card px-3 py-1 text-xs font-medium text-foreground/60">
          <span className="size-1.5 rounded-full bg-[#14F195]" />
          Live on Solana devnet
        </span>

        <h1 className="max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
          An x402-metered skill oracle for autonomous agents.
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-foreground/60">
          An AI agent pays a few cents in USDC, directly on-chain, to check
          whether a Solana address has a real skill credential behind it —
          sourced from{" "}
          <a
            href="https://theprova.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Prova&apos;s
          </a>{" "}
          on-chain attestation registry — before hiring or transacting with it.
          Every paid check mints its own proof-of-fulfillment attestation,
          independently verifiable by anyone.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href="#try-it"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Try it
            <span aria-hidden="true">&rarr;</span>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-low bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-cream"
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
