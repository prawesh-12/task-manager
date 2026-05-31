import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "task-manager",
  description: "Minimal task assignment app with Google login and Gmail notifications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
