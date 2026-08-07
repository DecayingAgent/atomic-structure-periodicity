import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atomic Structure & Periodicity | ATOM/07",
  description: "An interactive Chapter 7 study companion for general chemistry.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
