import { NextResponse, type NextRequest } from "next/server";

/**
 * Deliberately a pass-through.
 *
 * This file exists so the customer portal has somewhere to land. When the
 * portal arrives, tenant resolution goes here: read the subdomain or the
 * custom domain off `request.headers.get("host")`, look up which client it
 * belongs to, and forward it to the app via a request header or a rewrite.
 *
 * Nothing about multi-tenancy is implemented yet, and nothing should be
 * added here for the marketing site.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Static assets and the image optimizer never need tenant resolution.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"],
};
