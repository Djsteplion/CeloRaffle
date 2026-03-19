'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { CELO_SEPOLIA } from './contracts';

export const wagmiConfig = getDefaultConfig({
  appName: 'Celo Raffle',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'celo-raffle-demo',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chains: [CELO_SEPOLIA as any],
  ssr: true,
});