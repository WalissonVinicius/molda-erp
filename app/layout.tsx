import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Molda ERP",
  description:
    "ERP da Molda — gestão de prospecção, propostas, contratos e financeiro recorrente.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Sidebar />
        <main className="min-w-0 px-5 pb-16 pt-20 sm:px-8 lg:pl-72 lg:pr-8 lg:pt-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
