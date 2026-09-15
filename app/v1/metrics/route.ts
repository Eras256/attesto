import { NextResponse } from "next/server";
import { computeMetrics } from "@/app/lib/server/metrics";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/** Public, unpaid, computed live from devnet — never hardcoded. */
export async function GET() {
  const metrics = await computeMetrics();
  return NextResponse.json(metrics, { status: 200, headers: corsHeaders() });
}
