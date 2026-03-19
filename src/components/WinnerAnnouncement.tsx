'use client';

import React from 'react';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther } from 'viem';
import { ExternalLink, X, Trophy, Sparkles } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';

interface WinnerAnnouncementProps {
  winner: string | null;
  prize: bigint | null;
  raffleId: bigint | null;
  txHash: string | null;
  onClose: () => void;
}

export function WinnerAnnouncement({
  winner,
  prize,
  raffleId,
  txHash,
  onClose,
}: WinnerAnnouncementProps) {
  const { fire } = useConfetti();

  useEffect(() => {
    if (winner) {
      fire();
      const t1 = setTimeout(fire, 1200);
      const t2 = setTimeout(fire, 2400);
      const t3 = setTimeout(fire, 3600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [winner, fire]);

  const prizeAmount = prize
    ? parseFloat(formatEther(prize)).toFixed(2)
    : '0';

  const rajdhani: React.CSSProperties = { fontFamily: 'Rajdhani, sans-serif' };

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(16px)', background: 'rgba(5,5,15,0.88)' }}
          onClick={onClose}
        >
          {/* Background glow bursts */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut', delay: 0.2 }}
              className="w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(252,255,82,0.3) 0%, transparent 70%)' }}
            />
          </div>

          <motion.div
            initial={{ scale: 0.4, y: 80, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.4, y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260, delay: 0.05 }}
            className="relative max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* ── Rotating glow ring ── */}
            <div className="absolute -inset-5 rounded-4xl pointer-events-none overflow-hidden opacity-60">
              <motion.div
                className="absolute inset-0 rounded-4xl"
                style={{
                  background:
                    'conic-gradient(from 0deg, #FCFF52, #FFD700, #8B5CF6, #35D07F, #FCFF52)',
                  filter: 'blur(18px)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* ── Modal card ── */}
            <div
              className="relative rounded-2xl overflow-hidden border border-[#FCFF52]/30"
              style={{ background: 'linear-gradient(145deg, #0D0D20 0%, #05050F 100%)' }}
            >
              {/* Top accent */}
              <div className="h-0.75 w-full bg-linear-to-r from-[#8B5CF6] via-[#FCFF52] to-[#35D07F]" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>

              <div className="px-6 sm:px-10 py-8 sm:py-10 text-center">

                {/* ── Trophy ── */}
                <div className="relative flex items-center justify-center mb-6">
                  {/* Outer ring */}
                  <motion.div
                    className="absolute w-28 h-28 rounded-full border-2 border-dashed border-[#FCFF52]/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  {/* Middle ring */}
                  <motion.div
                    className="absolute w-20 h-20 rounded-full border border-[#FFD700]/30"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  />
                  {/* Trophy icon */}
                  <motion.div
                    animate={{
                      rotate: [-8, 8, -8, 8, 0],
                      scale: [1, 1.08, 1, 1.08, 1],
                    }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-[#FFD700]/30 to-[#FCFF52]/10 border border-[#FFD700]/40 flex items-center justify-center shadow-lg shadow-[#FFD700]/20"
                  >
                    <Trophy size={32} className="text-[#FFD700]" />
                  </motion.div>
                </div>

                {/* ── WAGMI headline ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles size={12} className="text-[#FCFF52]/60" />
                    <span
                      className="text-[10px] font-label text-white/30 tracking-[0.25em] uppercase"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      Raffle #{raffleId?.toString()} {winner ? `${winner.slice(0, 6)}...${winner.slice(-4)}` : ''}
                    </span>
                    <Sparkles size={12} className="text-[#FCFF52]/60" />
                  </div>

                  <h2
                    className="prize-gradient-text font-display font-black mb-1"
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    WAGMI
                  </h2>

                  {/* Winner address */}
                  <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <span
                      className="font-display text-xs sm:text-sm text-white/70 tracking-wider"
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {winner}
                    </span>
                  </div>
                </motion.div>

                {/* ── Prize box ── */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', damping: 18 }}
                  className="relative mt-6 mb-6 rounded-xl border border-[#FCFF52]/25 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(252,255,82,0.08), rgba(255,215,0,0.04))' }}
                >
                  {/* Shimmer sweep */}
                  <motion.div
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/8 to-transparent -skew-x-12"
                    animate={{ x: ['-150%', '250%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                  />
                  <div className="relative px-6 py-5">
                    <p
                      className="text-[10px] font-label text-white/30 tracking-[0.2em] uppercase mb-2"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      Prize Won
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span
                        className="prize-gradient-text font-display font-black"
                        style={{
                          fontFamily: 'Orbitron, monospace',
                          fontSize: 'clamp(2.5rem, 10vw, 4rem)',
                          lineHeight: 1,
                        }}
                      >
                        {prizeAmount}
                      </span>
                      <span
                        className="font-display text-lg font-bold text-[#FCFF52]/50"
                        style={{ fontFamily: 'Orbitron, monospace' }}
                      >
                        CELO
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* ── Provenance ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                >
                  <p
                    className="text-[10px] text-white/20 tracking-widest mb-4"
                    style={rajdhani}
                  >
                    SELECTED BY VRF · PROVABLY FAIR
                  </p>

                  <div className="flex flex-col items-center gap-3">
                    {txHash && (
                       <a
                        href={`https://sepolia.celoscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FCFF52]/10 border border-[#FCFF52]/25 text-[#FCFF52] text-xs font-semibold tracking-wider hover:bg-[#FCFF52]/20 transition-all w-full justify-center"
                        style={rajdhani}
                      >
                        VERIFY DRAW TX <ExternalLink size={11} />
                      </a>
                    )}

                    <div className="flex items-center gap-3 w-full">
                      <a
                        href={`https://sepolia.celoscan.io/address/${winner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#35D07F]/10 border border-[#35D07F]/25 text-[#35D07F] text-xs font-semibold tracking-wider hover:bg-[#35D07F]/20 transition-all"
                        style={rajdhani}
                      >
                        {winner ? `${winner.slice(0, 6)}...${winner.slice(-4)}` : ''} <ExternalLink size={11} />
                      </a>

                      <button
                        onClick={onClose}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs font-semibold tracking-wider hover:bg-white/10 hover:text-white/60 transition-all"
                        style={rajdhani}
                      >
                        CLOSE
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom glow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-[#FCFF52]/30 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}