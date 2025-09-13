"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// If you haven't installed shadcn/ui yet, run:
// npx shadcn@latest add button card badge

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_80%_20%,rgba(16,185,129,.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50rem_30rem_at_10%_80%,rgba(244,114,182,.08),transparent)]" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <Badge className="mb-4 rounded-full px-3 py-1 text-xs">
            New · Linkyard 0.1
          </Badge>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Your links, on an{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-emerald-500 bg-clip-text text-transparent">
              infinite whiteboard
            </span>
            .
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Paste any URL. Linkyard drops a draggable, zoomable card with a live
            preview. Organize, cluster, and think spatially.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button className="h-11 rounded-full px-6">Get Started</Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-6 border-zinc-300"
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link href="/board">
                <Button className="h-11 rounded-full px-6">
                  Open your board
                </Button>
              </Link>
              <Link href="/board">
                <Button variant="outline" className="h-11 rounded-full px-6">
                  Continue
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Mock board preview */}
          <div className="mt-12 w-full">
            <Card className="mx-auto w-full max-w-5xl overflow-hidden border-zinc-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-left text-sm font-medium text-zinc-700">
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="relative h-[380px] w-full rounded-xl border border-zinc-200 bg-white">
                  {/* grid */}
                  <div className="absolute inset-0 opacity-[0.35] [background:linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] [background-size:32px_32px]" />
                  {/* sample cards */}
                  <div className="absolute left-6 top-8 w-[280px] rotate-[-2deg] rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-zinc-100">
                      <Image
                        src="/window.svg"
                        alt=""
                        width={640}
                        height={360}
                        className="h-full w-full object-contain p-6 opacity-70"
                      />
                    </div>
                    <div className="mt-2 line-clamp-1 text-sm font-semibold">
                      Design engineering handbook
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      intercom.com
                    </div>
                  </div>

                  <div className="absolute left-[360px] top-[90px] w-[280px] rotate-[1.2deg] rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-zinc-100">
                      <Image
                        src="/globe.svg"
                        alt=""
                        width={640}
                        height={360}
                        className="h-full w-full object-contain p-6 opacity-70"
                      />
                    </div>
                    <div className="mt-2 line-clamp-1 text-sm font-semibold">
                      Building AI-enabled products
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">vercel.com</div>
                  </div>

                  <div className="absolute left-[210px] top-[230px] w-[280px] rotate-[-.5deg] rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-zinc-100">
                      <Image
                        src="/file.svg"
                        alt=""
                        width={640}
                        height={360}
                        className="h-full w-full object-contain p-6 opacity-70"
                      />
                    </div>
                    <div className="mt-2 line-clamp-1 text-sm font-semibold">
                      Web performance checklist
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">web.dev</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle className="text-base">Paste to add</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">
              Hit{" "}
              <kbd className="rounded border border-zinc-300 px-1">⌘/Ctrl</kbd>{" "}
              + <kbd className="rounded border border-zinc-300 px-1">V</kbd> to
              drop a card anywhere. We fetch the preview automatically.
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle className="text-base">Drag, zoom, pan</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">
              Use the wheel to zoom and drag to pan. Cards snap to pixel-perfect
              positions.
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle className="text-base">Private by default</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">
              Your board is yours. Sign in with Clerk; data lives in Postgres
              (Neon).
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Ready to think with space?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Start with a clean canvas. Paste your first link and watch it come
            to life.
          </p>
          <div className="mt-6 flex gap-3">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button className="h-11 rounded-full px-6">
                  Create your board
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" className="h-11 rounded-full px-6">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/board">
                <Button className="h-11 rounded-full px-6">
                  Open your board
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-zinc-500 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Linkyard. Built with Next.js, Clerk,
        Drizzle & Neon.
      </footer>
    </main>
  );
}
