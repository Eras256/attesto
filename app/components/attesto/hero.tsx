function HeroMark() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-xs md:max-w-sm"
      aria-hidden="true"
    >
      <div
        className="hero-mark-glow absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(165,106,0,0.30) 0%, rgba(165,106,0,0.12) 40%, transparent 72%)",
        }}
      />
      <div
        className="hero-mark-ring-1 absolute inset-[6%] rounded-full"
        style={{ border: "1px solid rgba(165,106,0,0.28)" }}
      />
      <div
        className="hero-mark-ring-2 absolute inset-[16%] rounded-full"
        style={{ border: "1px solid rgba(165,106,0,0.14)" }}
      />
      <div className="hero-mark-float absolute inset-[30%] flex items-center justify-center rounded-full border border-border-low bg-card shadow-xl">
        <img
          src="/branding-attesto/svg/logo-featured-light.svg"
          alt=""
          className="w-[45%] dark:hidden"
        />
        <img
          src="/branding-attesto/svg/logo-featured-dark.svg"
          alt=""
          className="hidden w-[45%] dark:block"
        />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border-low bg-card px-3 py-1 text-xs font-medium text-foreground/60">
            {/* Solana green, kept deliberately: this dot names the Solana
                ecosystem, not Attesto's own mark — gold stays reserved for
                Attesto's "verified" meaning, not overloaded as a status light. */}
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
            on-chain attestation registry — before hiring or transacting with
            it. Every paid check mints its own proof-of-fulfillment attestation,
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

        <HeroMark />
      </div>
    </section>
  );
}
