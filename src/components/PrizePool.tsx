'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatEther } from 'viem';
import { RaffleInfo, RaffleState } from '@/hooks/useRaffle';
import { Trophy, Users, Tag, Cpu } from 'lucide-react';

interface PrizePoolProps {
  raffleInfo: RaffleInfo | null;
}

const STATE_CONFIG: Record<RaffleState, { label: string; color: string; bg: string; border: string; pulse: boolean }> = {
  [RaffleState.OPEN]: {
    label: 'LIVE',
    color: 'text-[#35D07F]',
    bg: 'bg-[#35D07F]/10',
    border: 'border-[#35D07F]/40',
    pulse: true,
  },
  [RaffleState.DRAWING]: {
    label: 'DRAWING',
    color: 'text-[#FCFF52]',
    bg: 'bg-[#FCFF52]/10',
    border: 'border-[#FCFF52]/40',
    pulse: true,
  },
  [RaffleState.CLOSED]: {
    label: 'CLOSED',
    color: 'text-[#FB7C6D]',
    bg: 'bg-[#FB7C6D]/10',
    border: 'border-[#FB7C6D]/40',
    pulse: false,
  },
};

export function PrizePool({ raffleInfo }: PrizePoolProps) {
  const stateInfo = raffleInfo
    ? STATE_CONFIG[raffleInfo.state]
    : STATE_CONFIG[RaffleState.OPEN];

  const prizePool = raffleInfo
    ? parseFloat(formatEther(raffleInfo.prizePool)).toFixed(2)
    : '0.00';

  const ticketPrice = raffleInfo
    ? parseFloat(formatEther(raffleInfo.ticketPrice)).toFixed(2)
    : '1.00';

  const raffleId = raffleInfo?.raffleId?.toString() || '1';
  const participantCount = raffleInfo?.participantCount?.toString() || '0';

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="game-card card-accent-yellow glow-yellow"
    >
      {/* Background glow blob */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#FCFF52]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#FFD700]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-7">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            {/* Status badge */}
            <div className={`status-badge flex items-center gap-1.5 ${stateInfo.bg} ${stateInfo.border} border ${stateInfo.color}`}
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-current ${stateInfo.pulse ? 'animate-pulse' : ''}`} />
              {stateInfo.label}
            </div>
            <span
              className="text-[11px] font-label text-white/30 tracking-widest"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              RAFFLE #{raffleId}
            </span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/20 flex items-center justify-center">
            <Trophy size={16} className="text-[#FFD700]" />
          </div>
        </div>

        {/* ── Prize amount ── */}
        <div className="text-center py-4 sm:py-6">
          <p
            className="text-[10px] font-label font-semibold tracking-[0.22em] text-white/30 uppercase mb-3"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Total Prize Pool
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={prizePool}
              initial={{ y: 16, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="flex items-baseline justify-center gap-3"
            >
              <span
                className="prize-gradient-text font-display"
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 'clamp(3rem, 8vw, 5rem)',
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {prizePool}
              </span>
              <span
                className="font-display text-lg sm:text-2xl font-bold text-white/40"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                CELO
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-linear-to-r from-transparent to-white/10" />
            <span className="text-[10px] font-label text-white/20 tracking-widest"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              PROVABLY FAIR · CHAINLINK VRF
            </span>
            <div className="flex-1 h-px bg-linear-to-l from-transparent to-white/10" />
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <StatCard
            icon={<Users size={13} className="text-[#8B5CF6]" />}
            label="Players"
            value={participantCount}
            accent="purple"
          />
          <StatCard
            icon={<Tag size={13} className="text-[#35D07F]" />}
            label="Per Ticket"
            value={`${ticketPrice}`}
            sub="CELO"
            accent="green"
          />
          <StatCard
            icon={<Cpu size={13} className="text-[#FCFF52]" />}
            label="Randomness"
            value="VRF"
            sub="block.prevrandao"
            accent="yellow"
          />
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: 'purple' | 'green' | 'yellow';
}) {
  const borders = {
    purple: 'border-[#8B5CF6]/20 bg-[#8B5CF6]/5',
    green:  'border-[#35D07F]/20 bg-[#35D07F]/5',
    yellow: 'border-[#FCFF52]/20 bg-[#FCFF52]/5',
  };
  const valueColors = {
    purple: 'text-[#8B5CF6]',
    green:  'text-[#35D07F]',
    yellow: 'text-[#FCFF52]',
  };

  return (
    <div className={`rounded-xl border p-3 text-center ${borders[accent]}`}>
      <div className="flex items-center justify-center gap-1 mb-1.5">
        {icon}
        <span
          className="text-[10px] font-label text-white/40 tracking-wider"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          {label}
        </span>
      </div>
      <p
        className={`font-display font-bold text-sm ${valueColors[accent]}`}
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[9px] font-label text-white/25 mt-0.5 tracking-wider"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
