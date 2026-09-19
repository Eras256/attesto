import type { NextConfig } from "next";

const ATTESTO_BACKEND_URL = "https://attesto-api.fly.dev";

const nextConfig: NextConfig = {
  // "standalone" is for the Fly/Docker build only — it skips the trace
  // files Vercel's own build pipeline expects to post-process itself
  // (build fails on Vercel with output:"standalone" set unconditionally).
  // Vercel sets VERCEL=1 in its build environment automatically.
  output: process.env.VERCEL ? undefined : "standalone",
  serverExternalPackages: ["ws"],
  // attesto.xyz (this Vercel deployment) serves the frontend only. The real
  // backend — payment verification, the issuer key, the HMAC secret — runs
  // on Fly (attesto-api.fly.dev), same as Vouch402's split. `beforeFiles` is
  // required: without it, Next.js resolves the local /v1/* route files
  // first (they still exist in this codebase) and the rewrite never fires.
  // Keeps a single public domain matching the API reference docs, without
  // duplicating ATTESTO_HMAC_SECRET/ATTESTO_ISSUER_SECRET_KEY on Vercel.
  // Only applied on Vercel: this same standalone build also runs directly
  // on Fly (attesto-api.fly.dev), and an unconditional rewrite would proxy
  // that machine's own /v1/* requests back to itself -- a self-loop (real
  // incident: every /v1/* request hung with "socket hang up"/ECONNRESET
  // after adding middleware.ts made this surface). Checking FLY_APP_NAME
  // here does NOT work like it does in middleware.ts: rewrites() is
  // evaluated at build time (baked into routes-manifest.json), and the
  // Docker build step (`npm run build` in Dockerfile) never has
  // FLY_APP_NAME set -- that var is injected only into the running Fly
  // Machine, not the build. VERCEL is set during Vercel's own build, same
  // signal already used for `output` above, so check for that instead.
  async rewrites() {
    return {
      beforeFiles: process.env.VERCEL
        ? [
            {
              source: "/v1/:path*",
              destination: `${ATTESTO_BACKEND_URL}/v1/:path*`,
            },
          ]
        : [],
      // /branding-attesto (no trailing file) -> the static download page in
      // public/branding-attesto/. Next.js serves public/ files at their
      // exact path but doesn't auto-resolve a bare directory to its
      // index.html, so this rewrite is what makes the bare URL work.
      afterFiles: [
        {
          source: "/branding-attesto",
          destination: "/branding-attesto/index.html",
        },
      ],
      fallback: [],
    };
  },
  // @solana/kit-plugin-payer's browser bundle has a spurious `import 'fs'`
  // from the payerFromFile export. Stub it out for the client bundle.
  turbopack: {
    resolveAlias: {
      fs: { browser: "./empty-module.js" },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    return config;
  },
};

export default nextConfig;
