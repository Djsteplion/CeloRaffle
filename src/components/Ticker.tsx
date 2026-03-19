'use client';

import { motion } from 'framer-motion';

const TICKER_ITEMS = [
  'Powered by block.prevrandao (Temporary Alternative pending ChainLInk VRF)',
  'Payments in CELO',
  'Built on Celo Sepolia',
  'ERC-8004 Agent Identity',
  'x402 Payment Protocol',
  'Provably Fair Draws',
  'ARIA Agent Online',
];

export function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="overflow-hidden border-y border-[#FCFF52]/10 py-2 bg-[#FCFF52]/5">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="flex whitespace-nowrap"
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-xs font-mono text-[#FCFF52]/60 mx-8 tracking-widest uppercase">
            ◆ {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
