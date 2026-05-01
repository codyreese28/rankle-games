import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rankle Games",
  description:
    "Play daily ranking games featuring movies, music, video games, consoles, and more.",
  openGraph: {
    title: "Rankle Games",
    description:
      "Play daily ranking games featuring movies, music, video games, consoles, and more.",
    url: "https://ranklegames.com",
    siteName: "Rankle Games",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rankle Games",
    description:
      "Play daily ranking games featuring movies, music, video games, consoles, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
