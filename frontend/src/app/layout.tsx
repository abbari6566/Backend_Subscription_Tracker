import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subscription Tracker",
  description: "Track your subscriptions and never miss a renewal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
