'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';
import { Minus, Plus, Loader2, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { RaffleInfo, RaffleState } from '@/hooks/useRaffle';

interface TicketPurchaseProps {
  raffleInfo: RaffleInfo | null;
  userTickets: number;
  celoBalance: string;
  isConnected: boolean;
  isPending: boolean;
  isTxSuccess: boolean;
  onPurchase: (numTickets: number) => void;
}

export function TicketPurchase({
  raffleInfo,
  userTickets,
  celoBalance,
  isConnected,
  isPending,
  isTxSuccess,
  onPurchase,
}: TicketPurchaseProps) {
  const [quantity, setQuantity] = useState(1);

  const ticketPrice = raffleInfo ? parseFloat(formatEther(raffleInfo.ticketPrice)) : 0.01;
  const totalCost = (ticketPrice * quantity).toFixed(4);
  const isOpen = raffleInfo?.state === RaffleState.OPEN;
  const balance = parseFloat(celoBalance);
  const canAfford = balance >= parseFloat(totalCost);

  const increment = () => setQuantity(q => Math.min(q + 1, 50));
  const decrement = () => setQuantity(q => Math.max(q - 1, 1));

  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="game-card card-accent-green glow-green"
    >
      {/* Glow blob */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#35D07F]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-7">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#35D07F]/15 border border-[#35D07F]/25 flex items-center justify-center">
            <TicketIcon size={16} className="text-[#35D07F]" />
          </div>
          <h2
            className="font-display text-sm sm:text-base font-bold text-white tracking-wide"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            BUY TICKETS
          </h2>
          {isConnected && (
            <div className="ml-auto flex items-center gap-1.5">
              <Wallet size={11} className="text-[#35D07F]/60" />
              <span
                className="text-[11px] font-label text-white/40"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                <span className="text-[#35D07F]">{celoBalance}</span> CELO
              </span>
            </div>
          )}
        </div>

        {/* ── Not connected ── */}
        {!isConnected ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mx-auto pulse-ring-purple">
              <Wallet size={24} className="text-[#8B5CF6]" />
            </div>
            <p
              className="font-label text-sm text-white/40 tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              CONNECT WALLET TO PARTICIPATE
            </p>
            <ConnectButton />
          </div>

        ) : !isOpen ? (
          /* ── Raffle not open ── */
          <div className="text-center py-10 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FB7C6D]/10 border border-[#FB7C6D]/20 flex items-center justify-center mx-auto">
              <AlertCircle size={24} className="text-[#FB7C6D]" />
            </div>
            <p
              className="font-label text-sm text-white/40 tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {raffleInfo?.state === RaffleState.DRAWING
                ? 'DRAW IN PROGRESS...'
                : 'RAFFLE CLOSED'}
            </p>
          </div>

        ) : (
          <>
            {/* ── Quantity selector ── */}
            <div className="flex items-center gap-4 mb-5">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={decrement}
                disabled={quantity === 1}
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-25 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Minus size={15} />
              </motion.button>

              <div className="flex-1 text-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={quantity}
                    initial={{ y: -20, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 350 }}
                    className="block font-display font-black text-white neon-green"
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: 'clamp(2rem, 5vw, 3rem)',
                    }}
                  >
                    {quantity}
                  </motion.span>
                </AnimatePresence>
                <p
                  className="text-[10px] font-label text-white/30 tracking-widest mt-0.5"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  TICKETS
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={increment}
                disabled={quantity === 50}
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-25 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Plus size={15} />
              </motion.button>
            </div>

            {/* ── Quick select ── */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[1, 5, 10, 20].map(n => (
                <motion.button
                  key={n}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setQuantity(n)}
                  className={`py-2 rounded-lg text-xs font-display font-bold transition-all btn-shimmer ${
                    quantity === n
                      ? 'bg-[#35D07F] text-black shadow-lg shadow-[#35D07F]/25'
                      : 'bg-white/5 border border-white/8 text-white/50 hover:bg-white/8 hover:text-white/70'
                  }`}
                  style={{ fontFamily: 'Orbitron, monospace' }}
                >
                  ×{n}
                </motion.button>
              ))}
            </div>

            {/* ── Cost breakdown ── */}
            <div className="rounded-xl border border-[#35D07F]/15 bg-[#35D07F]/5 p-4 mb-5 space-y-2.5">
              <div className="flex justify-between items-center">
                <span
                  className="text-[11px] font-label text-white/35 tracking-wider"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {quantity} × {ticketPrice} CELO
                </span>
                <span
                  className="text-[11px] font-label text-white/50"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {totalCost} CELO
                </span>
              </div>
              <div className="h-px bg-white/8" />
              <div className="flex justify-between items-center">
                <span
                  className="text-xs font-label font-semibold text-white/50 tracking-wider"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  TOTAL
                </span>
                <span
                  className="font-display font-bold text-sm text-[#35D07F] neon-green"
                  style={{ fontFamily: 'Orbitron, monospace' }}
                >
                  {totalCost} CELO
                </span>
              </div>
              {!canAfford && (
                <p
                  className="text-[#FB7C6D] text-[11px] font-label tracking-wider"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  ⚠ Insufficient CELO balance
                </p>
              )}
            </div>

            {/* ── Your tickets ── */}
            {userTickets > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-[#35D07F]/8 border border-[#35D07F]/15"
              >
                <CheckCircle size={12} className="text-[#35D07F]" />
                <span
                  className="text-[11px] font-label text-[#35D07F]/80 tracking-wider"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  YOU HOLD {userTickets} TICKET{userTickets !== 1 ? 'S' : ''} IN THIS ROUND
                </span>
              </motion.div>
            )}

            {/* ── Purchase button ── */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onPurchase(quantity)}
              disabled={isPending || !canAfford}
              className="relative w-full py-4 rounded-xl font-display font-bold text-sm text-black bg-[#35D07F] hover:bg-[#3de090] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#35D07F]/20 btn-shimmer overflow-hidden"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              <AnimatePresence mode="wait">
                {isPending ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Loader2 size={15} className="animate-spin" />
                    PROCESSING...
                  </motion.div>
                ) : isTxSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={15} />
                    TICKETS SECURED!
                  </motion.div>
                ) : (
                  <motion.div
                    key="buy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <TicketIcon size={15} className="text-black" />
                    BUY {quantity} TICKET{quantity !== 1 ? 'S' : ''} · {totalCost} CELO
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <p
              className="text-center text-[10px] font-label text-white/20 mt-3 tracking-widest"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              NATIVE CELO · CELO SEPOLIA TESTNET
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}

function TicketIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <line x1="9" y1="2" x2="9" y2="22" />
    </svg>
  );
}
