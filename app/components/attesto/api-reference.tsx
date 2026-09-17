import { CopyButton } from "./copy-button";
import { SITE_URL } from "@/app/lib/site";

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-xl bg-[#0a0a0a] p-4 text-xs leading-relaxed text-[#e5e5e5]">
        <code>{code}</code>
      </pre>
      <CopyButton
        value={code}
        className="absolute top-2.5 right-2.5 border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
      />
    </div>
  );
}

const ENDPOINTS = [
  {
    method: "GET",
    path: "/v1/skill-check/:address",
    description:
      "402-then-retry: the first call returns the exact price; retry with the payment signature to get the score.",
    example: `# 1. Request without paying — get the price
curl ${SITE_URL}/v1/skill-check/9jFjRSwN7zchM83LDLHugcDmGKe3fJ7MKaZPZVb8VYvh

# 2. Pay the quoted USDC yourself: a transferChecked of maxAmountRequired
#    to payTo, PLUS an SPL Memo instruction (program
#    MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr) in the SAME transaction
#    whose data is the resourceId string from step 1, verbatim. Required —
#    it's what binds this payment to this specific request; a transfer of
#    the right amount with no memo (or the wrong one) is rejected.

# 3. Retry with proof
curl ${SITE_URL}/v1/skill-check/9jFjRSwN7zchM83LDLHugcDmGKe3fJ7MKaZPZVb8VYvh \\
  -H "X-PAYMENT: $(printf '%s' '{"x402Version":1,"scheme":"exact","network":"solana-devnet","payload":{"resourceId":"<resourceId from step 1>","signature":"<your confirmed transaction signature>"}}' | base64)"`,
  },
  {
    method: "GET",
    path: "/v1/metrics",
    description:
      "Public, unpaid. Computed live from getProgramAccounts on every request — never cached in a database.",
    example: `curl ${SITE_URL}/v1/metrics`,
  },
  {
    method: "POST",
    path: "/v1/disputes",
    description:
      "Verifies a file_dispute transaction you already signed and submitted yourself, and returns the on-chain record.",
    example: `curl -X POST ${SITE_URL}/v1/disputes \\
  -H "Content-Type: application/json" \\
  -d '{
    "resourceId": "<64-char hex resourceId>",
    "signature": "<your confirmed file_dispute transaction signature>"
  }'`,
  },
];

export function ApiReference() {
  return (
    <section id="api-reference" className="scroll-mt-20 py-16 md:py-20">
      <div className="mb-10 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          API reference
        </h2>
        <p className="max-w-2xl text-foreground/60">
          Three endpoints, no SDK required. Every request settles atomically —
          Attesto never holds a running balance for any caller.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {ENDPOINTS.map((endpoint) => (
          <div
            key={endpoint.path}
            className="rounded-2xl border border-border-low bg-card p-5"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-cream px-2 py-1 font-mono text-xs font-bold">
                {endpoint.method}
              </span>
              <code className="font-mono text-sm font-semibold">
                {endpoint.path}
              </code>
            </div>
            <p className="mb-4 text-sm text-foreground/60">
              {endpoint.description}
            </p>
            <CodeBlock code={endpoint.example} />
          </div>
        ))}
      </div>
    </section>
  );
}
