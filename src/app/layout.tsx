import type { Metadata } from "next";
import { primaryFont } from "@/fonts";
import "./globals.css";


export const metadata: Metadata = {
    manifest: "/manifest.json",
    title: "TDMS Tools"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${primaryFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
