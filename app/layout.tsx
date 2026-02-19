import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TopNav } from "@/components/top-nav";

export const metadata: Metadata = {
  title: "EnhanceTyping",
  description: "Modern speed typing practice with production-ready subscriptions and analytics."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <TopNav />
          <main className="container-shell py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
