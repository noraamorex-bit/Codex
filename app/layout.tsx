import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Physics Playground",
  description:
    "A polished browser physics sandbox for materials, particles, chain reactions, and beautiful experiments.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
