import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export default clerkMiddleware(async (_auth, request) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const apiOrigin = new URL(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  ).origin;
  const demoOrigin = new URL(
    process.env.NEXT_PUBLIC_DEMO_API_URL || "http://localhost:4001/api/v1",
  ).origin;
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://img.clerk.com https://images.unsplash.com",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin} ${demoOrigin} https://*.clerk.accounts.dev https://*.clerk.com https://*.sentry.io https://us.i.posthog.com ${process.env.NODE_ENV === "development" ? "ws://localhost:3000" : ""}`,
    "frame-src https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.clerk.accounts.dev https://*.clerk.com",
    "frame-ancestors 'none'",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
});
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};
