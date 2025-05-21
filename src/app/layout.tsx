import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// Load the fonts with desired weights and subsets
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'], // Added various weights
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Find&Flaunt',
  description: 'Uw persoonlijke AI-stijladviseur voor Shoeby.nl vondsten.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${playfairDisplay.variable} ${lato.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
