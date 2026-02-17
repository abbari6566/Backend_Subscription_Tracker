const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";
const BASE = `${API_URL}/api/v1`;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { success: false, error: json.error || json.message || "Request failed" };
  }
  return { success: true, ...json };
}

// Auth
export async function signUp(name: string, email: string, password: string) {
  return api<{ token: string; user: { _id: string; name: string; email: string } }>(
    "/auth/sign-up",
    { method: "POST", body: JSON.stringify({ name, email, password }) }
  );
}

export async function signIn(email: string, password: string) {
  return api<{ token: string; user: { _id: string; name: string; email: string } }>(
    "/auth/sign-in",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

// Subscriptions
export type Subscription = {
  _id: string;
  name: string;
  company: string;
  price: number;
  currency: string;
  details?: string;
  frequency: string;
  category: string;
  paymentMethod: string;
  status: string;
  startDate: string;
  renewalDate: string;
  user: string;
  createdAt: string;
  updatedAt: string;
};

export async function getMySubscriptions() {
  return api<Subscription[]>("/subscriptions");
}

export async function getReminders() {
  return api<Subscription[]>("/subscriptions/reminders");
}

export async function getSubscription(id: string) {
  return api<Subscription>(`/subscriptions/${id}`);
}

export async function createSubscription(body: Partial<Subscription>) {
  return api<Subscription>("/subscriptions", { method: "POST", body: JSON.stringify(body) });
}

export async function updateSubscription(id: string, body: Partial<Subscription>) {
  return api<Subscription>(`/subscriptions/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteSubscription(id: string) {
  return api<{ message: string }>(`/subscriptions/${id}`, { method: "DELETE" });
}
