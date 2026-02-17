"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getMySubscriptions,
  getReminders,
  deleteSubscription,
  type Subscription,
} from "@/lib/api";

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(price);
}

function SubscriptionCard({
  sub,
  onDelete,
  isReminder,
}: {
  sub: Subscription;
  onDelete: (id: string) => void;
  isReminder?: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!confirm("Delete this subscription?")) return;
    setDeleting(true);
    const res = await deleteSubscription(sub._id);
    setDeleting(false);
    if (res.success) onDelete(sub._id);
  };

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        isReminder
          ? "border-amber-500/50 bg-amber-500/5"
          : "border-slate-700/50 bg-slate-800/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate">{sub.name}</h3>
          <p className="text-slate-400 text-sm">{sub.company}</p>
          <p className="text-sky-400 font-medium mt-1">
            {formatCurrency(sub.price, sub.currency)}
            {sub.frequency && (
              <span className="text-slate-500 font-normal text-sm">
                {" "}/ {sub.frequency}
              </span>
            )}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Renews: {formatDate(sub.renewalDate)}
          </p>
          {sub.details && (
            <p className="text-slate-500 text-sm mt-1 truncate" title={sub.details}>
              {sub.details}
            </p>
          )}
          <span
            className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
              sub.status === "active"
                ? "bg-emerald-500/20 text-emerald-400"
                : sub.status === "cancelled"
                  ? "bg-slate-500/20 text-slate-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {sub.status}
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/dashboard/edit/${sub._id}`}
            className="text-sky-400 hover:text-sky-300 text-sm"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [reminders, setReminders] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !token) return;
    (async () => {
      const [subRes, remRes] = await Promise.all([
        getMySubscriptions(),
        getReminders(),
      ]);
      if (subRes.success && subRes.data) setSubscriptions(subRes.data);
      if (remRes.success && remRes.data) setReminders(remRes.data);
      setLoading(false);
    })();
  }, [token]);

  useEffect(() => {
    if (typeof window !== "undefined" && !token) router.replace("/login");
  }, [token, router]);

  const removeSub = (id: string) => {
    setSubscriptions((s) => s.filter((x) => x._id !== id));
    setReminders((r) => r.filter((x) => x._id !== id));
  };

  if (!token) return null;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-sky-400">
          SubTrack
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white font-medium">
            Dashboard
          </Link>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{user?.name}</span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-slate-400 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Your subscriptions</h1>
          <Link
            href="/dashboard/new"
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add subscription
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <>
            {reminders.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Due within 5 days
                </h2>
                <div className="space-y-3">
                  {reminders.map((sub) => (
                    <SubscriptionCard
                      key={sub._id}
                      sub={sub}
                      onDelete={removeSub}
                      isReminder
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold text-slate-300 mb-3">
                All subscriptions
              </h2>
              {subscriptions.length === 0 ? (
                <p className="text-slate-500">
                  No subscriptions yet.{" "}
                  <Link href="/dashboard/new" className="text-sky-400 hover:underline">
                    Add your first one
                  </Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <SubscriptionCard
                      key={sub._id}
                      sub={sub}
                      onDelete={removeSub}
                      isReminder={reminders.some((r) => r._id === sub._id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
