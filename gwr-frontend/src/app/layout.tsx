import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.scss';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { Provider } from '@/components/ui/provider';
import QueryProvider from '@/components/layout/QueryProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GWR Game Portal',
  description: 'Welcome to GWR Game Portal!',
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
        <Provider>
          <AuthProvider>
            <QueryProvider>
              <div className="wrap">
                <Header />
                <main className="main">{children}</main>
                <Footer />
              </div>
            </QueryProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
