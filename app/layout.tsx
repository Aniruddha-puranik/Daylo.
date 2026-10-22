import type { Metadata } from 'next';
import './globals.css';
import { SmoothScroll } from './components/SmoothScroll';
import { PwaInit } from './components/PwaInit';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')),
  title: 'Daylo — Make every day count',
  description: 'A quieter workspace for clearer days, focused work, and meaningful progress.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Daylo', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: '/icons/favicon.ico' }, { url: '/icons/daylo-mark.svg', type: 'image/svg+xml' }],
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: { title: 'Daylo — Make every day count', description: 'A quieter workspace for clearer days, focused work, and meaningful progress.', images: ['/og-image.png'] },
  twitter: { card: 'summary_large_image', title: 'Daylo — Make every day count', images: ['/og-image.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="paper-texture"><PwaInit/><SmoothScroll>{children}</SmoothScroll></body></html>;
}
