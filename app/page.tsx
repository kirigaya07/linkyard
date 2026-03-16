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
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Modern Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(80rem_50rem_at_50%_-20%,rgba(99,102,241,.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_80%_30%,rgba(16,185,129,.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70rem_40rem_at_10%_90%,rgba(244,114,182,.12),transparent)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <Badge className="mb-6 glass rounded-full px-4 py-2 text-sm font-semibold border border-white/20 shadow-modern animate-fade-in">
            ✨ New · Linkyard v0.1 · Smart Collections
          </Badge>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl animate-slide-up">
            Your links, on an{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent animate-pulse">
              infinite canvas
            </span>
            .
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 font-medium animate-slide-up">
            Drop any URL onto your infinite workspace. AI-powered smart
            clustering organizes your bookmarks automatically. Think spatially,
            work visually.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-slide-up">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button className="h-14 rounded-2xl px-8 text-base font-semibold btn-gradient shadow-modern hover:scale-105 transition-all duration-200">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Get Started Free
                </Button>
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
