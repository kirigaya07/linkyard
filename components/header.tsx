"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/20 backdrop-blur-xl shadow-modern animate-fade-in">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">
        {/* Left: Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:scale-105 transition-all duration-200"
        >
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-modern flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Linkyard
          </span>
        </Link>

        {/* Right: Auth controls */}
        <nav className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-2xl border border-white/30 bg-white/60 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-white/80 hover:scale-105">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-gradient rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-modern transition-all duration-200 hover:scale-105">
                Sign Up Free
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/board"
              className="rounded-2xl bg-white/60 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/80 transition-all duration-200 hover:scale-105 border border-white/30"
            >
              My Board
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-11 w-11 rounded-2xl shadow-modern",
                },
              }}
            />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
