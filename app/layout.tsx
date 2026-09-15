import type { Metadata } from "next";
import "./globals.css";
import "./expanded.css";
import VisitTracker from './visit-tracker';
import DeveloperCredit from './developer-credit';

export const metadata: Metadata = {
  title: "بيعة | هدوم وشنط على ذوقك",
  description: "اكتشفي بيعة، براند مصري أونلاين للهدوم البناتي والشنط الحريمي. حاجات على ذوقك.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased"><VisitTracker/>{children}<DeveloperCredit/></body>
    </html>
  );
}

