import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This same standalone build deploys to two places: Vercel (the real
// frontend, attesto.xyz) and Fly (the real backend, attesto-api.fly.dev,
// proxied at /v1/* from attesto.xyz -- see next.config.ts and
// DECISIONS.md). Without this, Fly also renders the full Next.js
// frontend at its own public URL -- a duplicate copy that silently goes
// stale every time the frontend changes without a matching Fly redeploy
// (real incident: it was still serving the pre-branding-pack UI after
// several rounds of frontend work). FLY_APP_NAME is set automatically by
// Fly's own runtime and never set on Vercel, so this only activates on
// Fly.
export function middleware(request: NextRequest) {
  if (!process.env.FLY_APP_NAME) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/v1/")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(
    new URL(pathname + request.nextUrl.search, "https://attesto.xyz"),
    308,
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
