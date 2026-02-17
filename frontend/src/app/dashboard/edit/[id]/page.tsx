"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getSubscription,
  updateSubscription,
  type Subscription,
} from "@/lib/api";

const CURRENCIES = ["USD", "EUR", "BDT"];
const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];
const CATEGORIES = [
  "sports",
  "news",
  "entertainment",
  "lifestyle",
  "health",
  "technology",
  "finance",
  "other",
];
const STATUSES = ["active", "cancelled", "expired"];

export default function EditSubscriptionPage() {
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    company: "",
    price: "",
    currency: "USD",
    details: "",
    frequency: "monthly",
    category: "other",
    paymentMethod: "",
    status: "active",
    startDate: "",
    renewalDate: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    if (!id || !token) return;
    (async () => {
      const res = await getSubscription(id);
      setFetching(false);
      if (res.success && res.data) {
        const sub = res.data as Subscription;
        setForm({
          name: sub.name,
          company: sub.company,
          price: String(sub.price),
          currency: sub.currency || "USD",
          details: sub.details || "",
          frequency: sub.frequency || "monthly",
          category: sub.category || "other",
          paymentMethod: sub.paymentMethod || "",
          status: sub.status || "active",
          startDate: sub.startDate
            ? new Date(sub.startDate).toISOString().slice(0, 10)
            : "",
          renewalDate: sub.renewalDate
            ? new Date(sub.renewalDate).toISOString().slice(0, 10)
            : "",
        });
      } else {
        setError("Subscription not found");
      }
    })();
  }, [id, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      setError("Enter a valid price");
      setLoading(false);
      return;
    }
    const res = await updateSubscription(id, {
      name: form.name,
      company: form.company,
      price,
      currency: form.currency,
      details: form.details || undefined,
      frequency: form.frequency,
      category: form.category,
      paymentMethod: form.paymentMethod,
      status: form.status as "active" | "cancelled" | "expired",
      startDate: form.startDate || undefined,
      renewalDate: form.renewalDate || undefined,
    });
    setLoading(false);
    if (res.success) {
      router.push("/dashboard");
      return;
    }
    setError(res.error || "Failed to update subscription");
  }

  if (!token) return null;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-slate-700/50 px-6 py-4">
        <Link href="/dashboard" className="text-sky-400 font-semibold">
          ← Dashboard
        </Link>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Edit subscription</h1>
        {fetching ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name *</label>
              <input
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Company to be paid *
              </label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) =>
                  setForm((f) => ({ ...f, company: e.target.value }))
                }
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currency: e.target.value }))
                  }
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Details</label>
              <textarea
                value={form.details}
                onChange={(e) =>
                  setForm((f) => ({ ...f, details: e.target.value }))
                }
                rows={2}
                maxLength={500}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Start date *
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Renewal date
                </label>
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, renewalDate: e.target.value }))
                  }
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Frequency *
              </label>
              <select
                value={form.frequency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, frequency: e.target.value }))
                }
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Payment method *
              </label>
              <input
                type="text"
                required
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentMethod: e.target.value }))
                }
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
              >
                {loading ? "Saving…" : "Save changes"}
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2.5 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800/50 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
