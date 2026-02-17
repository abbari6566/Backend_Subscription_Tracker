"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, token, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-sky-400">
          SubTrack
        </Link>
        <div className="flex gap-4">
          {token && user ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{user.name}</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="text-slate-400 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Track every subscription.
          <br />
          <span className="text-sky-400">Never miss a renewal.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-10">
          Add your subscriptions, set reminders for due dates, and keep amount,
          company, and payment details in one place.
        </p>
        {!token && (
          <Link
            href="/signup"
            className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-medium text-lg transition"
          >
            Create free account
          </Link>
        )}
        {token && (
          <Link
            href="/dashboard"
            className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-medium text-lg transition"
          >
            Go to Dashboard
          </Link>
        )}
      </main>
    </div>
  );
}
