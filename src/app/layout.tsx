import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "One Minute Bulletin",
  description: "Turn text into a one minute video bulletin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Footer */}
        <footer className="pb-2 text-center bg-indigo-900">
          <div className="max-w-lg mx-auto px-4">
            <div className="border-t border-white/20 pt-8">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Built with 😁 at <a href="https://sundai.club" target="_blank" rel="noopener noreferrer">SundAI</a> by
                &nbsp;<a href="https://x.com/debamitro" target="_blank" rel="noopener noreferrer">@debamitro</a>
              </p>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
