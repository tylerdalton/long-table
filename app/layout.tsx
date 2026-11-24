import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

// Everything here is live family data; never prerender at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Long Table",
  description: "Our family's holiday table: who's coming, who's bringing what, and every year we've gathered.",
  appleWebApp: { capable: true, title: "Long Table", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f5eee2",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
