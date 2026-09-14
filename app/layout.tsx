import type { Metadata } from "next";
import "./globals.css";
import "./expanded.css";

export const metadata: Metadata = {
  title: "بيعة | هدوم وشنط على ذوقك",
  description: "اكتشفي بيعة، براند مصري أونلاين للهدوم البناتي والشنط الحريمي. حاجات على ذوقك.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}

