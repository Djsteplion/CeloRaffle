'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { Zap, Radio } from 'lucide-react';

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full bg-linear-to-r from-transparent via-[#8B5CF6] to-transparent" />

      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#05050F]/90 backdrop-blur-2xl border-b border-white/6">

        {/* ── Logo ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-[#FCFF52] rounded-lg flex items-center justify-center shadow-lg shadow-[#FCFF52]/30">
              <Zap size={17} className="text-black" fill="black" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#35D07F] border-2 border-[#05050F] blink-dot" />
          </div>

          <div className="flex flex-col leading-none">
            <div className="flex items-baseline gap-0.5">
              <span
                className="text-white font-display text-base sm:text-lg font-bold tracking-tight"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                CELO
              </span>
              <span
                className="text-[#FCFF52] font-display text-base sm:text-lg font-bold tracking-tight neon-yellow"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                RAFFLE
              </span>
            </div>
          </div>

          {/* Network badge */}
          <span
            className="hidden sm:flex items-center gap-1.5 text-[10px] font-label font-600 text-[#8B5CF6] border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2.5 py-1 rounded-full tracking-widest"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
            CELO SEPOLIA
          </span>
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* ARIA status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20"
          >
            <Radio size={11} className="text-[#8B5CF6]" />
            <span
              className="text-[11px] font-label font-semibold text-[#8B5CF6] tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ARIA ONLINE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#35D07F] blink-dot" />
          </motion.div>

          {/* Wallet */}
          <div className="[&_.rk-connectButton]:font-display! [&_.rk-connectButton]:text-xs! [&_.rk-connectButton]:rounded-xl!">
            <ConnectButton
              accountStatus="avatar"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
