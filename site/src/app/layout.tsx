import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bird Flight Physics",
  description:
    "Rigorous mathematical treatment of bird wing flapping: unsteady aerodynamics, vortex dynamics, and interactive 3D visualization.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/physics/wing-flapping", label: "Wing Flapping" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#05070a] text-slate-200">
        <header className="border-b border-slate-800 bg-black/60 backdrop-blur sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
            <Link href="/" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
              Bird Flight Physics
            </Link>
            <nav className="flex gap-4 text-sm text-slate-400">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-sky-300 transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">{children}</main>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          Built with Next.js · MDX · React Three Fiber · KaTeX
        </footer>
      </body>
    </html>
  );
}
