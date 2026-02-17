"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signIn } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.success && res.data) {
      const { token, user } = res.data as { token: string; user: { _id: string; name: string; email: string } };
      setToken(token);
      setUser(user);
      router.push("/dashboard");
      return;
    }
    setError(res.error || "Sign in failed");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-sky-400 font-semibold block mb-8">
          ← SubTrack
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Sign in</h1>
        <p className="text-slate-400 mb-6">Welcome back. Sign in to your account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm text-slate-400 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-slate-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-sky-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
