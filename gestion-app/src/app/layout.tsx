import type { Metadata } from 'next';
import { Cormorant_Garamond, Hanken_Grotesk, Lora } from 'next/font/google';
import { cn } from '@/lib/cn';
import './globals.css';

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gestion — Matière & Nuance',
  description: 'Cockpit financier — Matière & Nuance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cn(hankenGrotesk.variable, cormorantGaramond.variable, lora.variable)}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
