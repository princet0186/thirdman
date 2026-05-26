import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavigationRail from "@/components/layout/NavigationRail";
import CommandHeader from "@/components/layout/CommandHeader";
import { AppProvider } from "@/lib/AppContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Third Man | Enterprise Intelligence",
  description: "Advanced football analytics workbench",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${mono.variable} antialiased bg-[#e2e8f0] text-[#0f172a] h-screen overflow-hidden flex font-sans text-sm`}
      >
        <AppProvider>
          <NavigationRail />
          <div className="flex-1 flex flex-col min-w-0">
            <CommandHeader />
            <main className="flex-1 p-2 overflow-hidden">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
