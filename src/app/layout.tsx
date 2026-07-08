import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoe Assist",
  description: "Encrypted question intake with configurable LLM routing"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
