import type { Metadata } from "next";
import "./globals.css";
import { PwaRegister } from "./pwa-register";

export const viewport = {
  themeColor: "#070a10",
};

export const metadata: Metadata = {
  title: "Physics Playground",
  description:
    "A polished browser physics sandbox for materials, particles, chain reactions, and beautiful experiments.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Physics Playground",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
