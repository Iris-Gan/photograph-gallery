import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haolin Gan — Exhibition Demo",
  description: "A restrained horizontal photography exhibition prototype.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
