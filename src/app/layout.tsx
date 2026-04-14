import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "UniVerse — Your Campus, One Platform",
  description:
    "UniVerse is the ultimate campus platform for Manipal University Jaipur. Discover clubs, explore events, and connect with your campus community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-universe`}>
        <AppProvider>
          <Navbar />
          <main className="relative z-10 pt-16">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
