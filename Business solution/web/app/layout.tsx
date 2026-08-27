import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'LedgerLite — AI Bookkeeping',
  description: "Snap it, and it's booked. AI bookkeeping for businesses that can't afford a bookkeeper."
};

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#12A150' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-bg text-ink antialiased">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
