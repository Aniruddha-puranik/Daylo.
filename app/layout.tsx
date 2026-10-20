import type { Metadata } from 'next';
import './globals.css';
import { SmoothScroll } from './components/SmoothScroll';

export const metadata: Metadata = { title: 'Daylo — Make every day count', description: 'A quieter workspace for clearer days, focused work, and meaningful progress.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SmoothScroll>{children}</SmoothScroll></body></html>;
}
