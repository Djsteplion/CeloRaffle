import type { Metadata } from 'next';
import { Orbitron, Rajdhani, Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/WalletProvider';
import { Navbar } from '@/components/Navbar';
import { Ticker } from '@/components/Ticker';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-label',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Celo Raffle — Agent-Powered On-Chain Lottery',
  description:
    'Provably fair raffle on Celo with block.prevrandao, native CELO payments, AI agent commentary & more.',
  openGraph: {
    title: 'Celo Raffle',
    description: 'Agent-powered lottery on Celo Sepolia',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${rajdhani.variable} ${inter.variable}`}
    >
      <body
        className="antialiased"
        style={{ background: '#05050F', color: '#E2E8F0', fontFamily: 'var(--font-body)' }}
      >
        <WalletProvider>
          <Navbar />
          <Ticker />
          <main>{children}</main>
          <footer className="border-t border-white/5 py-8 text-center">
            <p
              className="text-xs text-white/20 tracking-widest"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              Built on Celo Sepolia · Block.Prevrandao with (Chainlink VRF ready) Architecture · ERC-8004 · x402 · GEMINI AI
            </p>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
