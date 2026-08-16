import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Almas Jewels | Luxury Bridal Jewelry',
  description:
    'Almas Jewels — handcrafted luxury bridal jewelry including Kundan, Polki, Meenakari & more. Shop exclusive bridal sets, necklaces, earrings, and pendants for your special day.',
  keywords: ['bridal jewelry', 'kundan', 'polki', 'meenakari', 'luxury jewelry', 'Indian bridal'],
  openGraph: {
    title: 'Almas Jewels | Luxury Bridal Jewelry',
    description: 'Handcrafted luxury bridal jewelry for your special day.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white font-sans text-gray-900 antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
