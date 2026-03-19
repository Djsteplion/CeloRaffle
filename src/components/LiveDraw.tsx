'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RaffleState } from '@/hooks/useRaffle';
import { Shuffle, Trophy, Users } from 'lucide-react';

interface LiveDrawProps {
  participants: readonly `0x${string}`[];
  raffleState: RaffleState;
  winner?: string;
}

export function LiveDraw({ participants, raffleState, winner }: LiveDrawProps) {
  const [displayedAddress, setDisplayedAddress] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (raffleState === RaffleState.DRAWING && participants.length > 0) {
      setIsSpinning(true);
      let speed = 50;
      let count = 0;

      const spin = () => {
        const random = participants[Math.floor(Math.random() * participants.length)];
        setDisplayedAddress(random);
        count++;
        if (count > 30) speed = Math.min(speed * 1.1, 500);
        intervalRef.current = setTimeout(spin, speed);
      };

      intervalRef.current = setTimeout(spin, speed);
    } else if (raffleState === RaffleState.CLOSED && winner) {
      clearTimeout(intervalRef.current);
      setIsSpinning(false);
      setDisplayedAddress(winner);
    }

    return () => clearTimeout(intervalRef.current);
  }, [raffleState, participants, winner]);

  if (participants.length === 0) return null;

  const uniqueParticipants = [...new Set(participants)];
  const isDrawing = raffleState === RaffleState.DRAWING;
  const isClosed = raffleState === RaffleState.CLOSED;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="game-card card-accent-yellow glow-yellow"
    >
      {/* Glow blob */}
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#FCFF52]/6 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-7">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDrawing
                ? 'bg-[#FCFF52]/15 border border-[#FCFF52]/25'
                : isClosed
                ? 'bg-[#FFD700]/15 border border-[#FFD700]/25'
                : 'bg-white/8 border border-white/10'
            }`}>
              {isClosed
                ? <Trophy size={16} className="text-[#FFD700]" />
                : <Shuffle size={16} className={isDrawing ? 'text-[#FCFF52]' : 'text-white/50'} />
              }
            </div>
            <div>
              <h2
                className="font-display text-sm font-bold text-white tracking-wide"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                {isDrawing ? 'DRAWING...' : isClosed ? 'WINNER DRAWN' : 'PARTICIPANTS'}
              </h2>
              <p
                className="text-[10px] font-label text-white/30 tracking-wider mt-0.5"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {uniqueParticipants.length} UNIQUE ADDRESSES · {participants.length} TOTAL TICKETS
              </p>
            </div>
          </div>

          {/* Live indicator */}
          {isDrawing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FCFF52]/10 border border-[#FCFF52]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FCFF52] animate-pulse" />
              <span
                className="text-[10px] font-label font-semibold text-[#FCFF52] tracking-widest"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                LIVE
              </span>
            </div>
          )}
        </div>

        {/* ── Slot machine display ── */}
        {(isDrawing || isClosed) && (
          <div className={`relative mb-5 rounded-xl overflow-hidden border-2 ${
            isClosed
              ? 'border-[#FFD700]/60 bg-[#FFD700]/5'
              : 'border-[#FCFF52]/40 bg-black/60'
          } ${isDrawing ? 'scanline-overlay' : ''}`}>

            {/* Top/bottom fade */}
            <div className="absolute inset-x-0 top-0 h-8 bg-linear-to-b from-black/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-black/80 to-transparent z-20 pointer-events-none" />

            <div className="px-4 py-5 min-h-16 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={displayedAddress}
                  initial={{ y: isSpinning ? -18 : 0, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: isSpinning ? 18 : 0, opacity: 0 }}
                  transition={{ duration: 0.06 }}
                  className={`font-display text-center font-bold tracking-wider break-all text-xs sm:text-sm ${
                    isClosed
                      ? 'text-[#FFD700] neon-yellow'
                      : 'text-white/60'
                  }`}
                  style={{ fontFamily: 'Orbitron, monospace' }}
                >
                  {displayedAddress || '0x...'}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Spinning dots */}
            {isDrawing && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-30">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#FCFF52]"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}

            {/* Winner crown */}
            {isClosed && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-2 right-3 text-base z-30"
              >
                🏆
              </motion.div>
            )}
          </div>
        )}

        {/* ── Participants list ── */}
        <div className="space-y-1 max-h-44 overflow-y-auto scrollbar-thin pr-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={11} className="text-white/25" />
            <span
              className="text-[10px] font-label text-white/25 tracking-widest"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ENTRANTS
            </span>
          </div>

          {uniqueParticipants.map((addr, i) => {
            const ticketCount = participants.filter(p => p === addr).length;
            const isWinner =
              isClosed && addr.toLowerCase() === winner?.toLowerCase();
            const winPct =
              participants.length > 0
                ? ((ticketCount / participants.length) * 100).toFixed(1)
                : '0';

            return (
              <motion.div
                key={addr}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                  isWinner
                    ? 'bg-[#FFD700]/15 border border-[#FFD700]/40'
                    : 'bg-white/4 border border-transparent hover:bg-white/6'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isWinner && <span className="text-sm shrink-0">🏆</span>}
                  <span
                    className={`font-display font-medium truncate ${
                      isWinner ? 'text-[#FFD700]' : 'text-white/50'
                    }`}
                    style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.65rem' }}
                  >
                    {addr.slice(0, 6)}...{addr.slice(-5)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {/* Win chance bar */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <div className="w-16 h-1 rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${winPct}%` }}
                        transition={{ delay: i * 0.025 + 0.2 }}
                        className={`h-full rounded-full ${isWinner ? 'bg-[#FFD700]' : 'bg-[#8B5CF6]'}`}
                      />
                    </div>
                    <span
                      className="text-[9px] font-label text-white/25 w-8 text-right"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      {winPct}%
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-label font-semibold px-1.5 py-0.5 rounded ${
                      isWinner
                        ? 'text-[#FFD700] bg-[#FFD700]/10'
                        : 'text-[#8B5CF6] bg-[#8B5CF6]/10'
                    }`}
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    ×{ticketCount}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
