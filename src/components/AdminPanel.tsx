'use client';

import { motion } from 'framer-motion';
import { Shield, Play, RotateCcw, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { RaffleState } from '@/hooks/useRaffle';

interface AdminPanelProps {
  raffleState: RaffleState;
  participantCount: number;
  onRequestDraw: () => void;
  onStartNewRaffle: () => void;
  isPending: boolean;
}

export function AdminPanel({
  raffleState,
  participantCount,
  onRequestDraw,
  onStartNewRaffle,
  isPending,
}: AdminPanelProps) {
  const needsMore = raffleState === RaffleState.OPEN && participantCount < 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="game-card card-accent-red"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Red glow blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FB7C6D]/6 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-5">
        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FB7C6D]/15 border border-[#FB7C6D]/25 flex items-center justify-center">
            <Shield size={14} className="text-[#FB7C6D]" />
          </div>
          <span
            className="text-[11px] font-display font-bold text-[#FB7C6D] tracking-widest"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            ADMIN CONTROLS
          </span>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#FB7C6D]/8 border border-[#FB7C6D]/15">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB7C6D] blink-dot" />
            <span
              className="text-[9px] font-label text-[#FB7C6D]/60 tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              PRIVILEGED
            </span>
          </div>
        </div>

        {/* ── State info bar ── */}
        <div className="flex items-center gap-3 mb-4 px-3 py-2 rounded-lg bg-white/3 border border-white/6">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            raffleState === RaffleState.OPEN
              ? 'bg-[#35D07F] animate-pulse'
              : raffleState === RaffleState.DRAWING
              ? 'bg-[#FCFF52] animate-pulse'
              : 'bg-[#FB7C6D]'
          }`} />
          <span
            className="text-[10px] font-label text-white/40 tracking-widest flex-1"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            {raffleState === RaffleState.OPEN && `OPEN · ${participantCount} PARTICIPANT${participantCount !== 1 ? 'S' : ''}`}
            {raffleState === RaffleState.DRAWING && 'AWAITING CHAINLINK VRF RANDOMNESS'}
            {raffleState === RaffleState.CLOSED && 'ROUND COMPLETE · READY FOR NEW RAFFLE'}
          </span>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* OPEN → Request Draw */}
          {raffleState === RaffleState.OPEN && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onRequestDraw}
              disabled={isPending || needsMore}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-bold text-xs text-black bg-[#FCFF52] hover:bg-[#feff6a] disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#FCFF52]/15 btn-shimmer"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {isPending
                ? <><Loader2 size={13} className="animate-spin" /> REQUESTING...</>
                : <><Play size={13} fill="black" /> REQUEST DRAW</>
              }
            </motion.button>
          )}

          {/* CLOSED → New Raffle */}
          {raffleState === RaffleState.CLOSED && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onStartNewRaffle}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-bold text-xs text-black bg-[#35D07F] hover:bg-[#3de090] disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#35D07F]/15 btn-shimmer"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {isPending
                ? <><Loader2 size={13} className="animate-spin" /> STARTING...</>
                : <><RotateCcw size={13} /> NEW RAFFLE</>
              }
            </motion.button>
          )}

          {/* DRAWING → Waiting */}
          {raffleState === RaffleState.DRAWING && (
            <div className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#FCFF52]/8 border border-[#FCFF52]/20">
              <Clock size={13} className="text-[#FCFF52] animate-spin" style={{ animationDuration: '3s' }} />
              <span
                className="text-xs font-display text-[#FCFF52]/70 tracking-wider"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                AWAITING VRF...
              </span>
            </div>
          )}
        </div>

        {/* ── Warning ── */}
        {needsMore && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-[#FB7C6D]/8 border border-[#FB7C6D]/15"
          >
            <AlertTriangle size={11} className="text-[#FB7C6D] shrink-0" />
            <span
              className="text-[10px] font-label text-[#FB7C6D]/70 tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              MINIMUM 2 PARTICIPANTS REQUIRED TO DRAW
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
