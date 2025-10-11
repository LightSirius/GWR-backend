import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GWR Game Portal",
  description: "Welcome to GWR Game Portal!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100`}
      >
        <div id="theme_top">
          <div className="theme01"></div>
          <div className="theme02"></div>
          <div className="theme03"></div>
          <div className="theme04"></div>
          <div className="theme05"></div>
        </div>
        <div id="theme_foot">
          <div className="theme06"></div>
          <div className="theme07"></div>
          <div className="theme08"></div>
          <div className="theme09"></div>
          <div className="theme10"></div>
        </div>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <div id="footer_padding" style={{ paddingTop: '200px' }}></div>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
