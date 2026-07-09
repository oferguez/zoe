import type { Metadata } from "next";
import { AppHeader } from "@/components/nav/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "eliza",
  description: "Privacy-first chronic pain intake and GP summary assistant"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
