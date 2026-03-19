import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pillars Radar",
  description: "High-signal content aggregator across AI + Health, Tech News, and Finance Tools",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📡</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Providers>
          <Navigation />
          <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
