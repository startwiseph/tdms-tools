import type { Metadata } from "next";
import { primaryFont } from "@/fonts";
import "./globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "TDMS Tools | PIC & SAF Generator",
  description: "Help mission partners fill out PIC & SAF documents for Ten Days missioners.",
  openGraph: {
    title: "TDMS Tools | PIC & SAF Generator",
    description: "Help mission partners fill out PIC & SAF documents for Ten Days missioners.",
    images: [
      {
        url: "https://i.imgur.com/cPUQ5PW.png",
        width: 1200,
        height: 630,
        alt: "TDMS Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description: "Help mission partners fill out PIC & SAF documents for Ten Days missioners.",
    images: ["https://i.imgur.com/cPUQ5PW.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${primaryFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
