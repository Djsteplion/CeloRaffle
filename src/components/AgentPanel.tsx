'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Zap, Cpu, BrainCircuit } from 'lucide-react';

interface AgentMessage {
  id: string;
  text: string;
  timestamp: number;
  event: string;
}

interface AgentPanelProps {
  messages: AgentMessage[];
  isThinking: boolean;
}

const EVENT_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; label: string; icon: string }
> = {
  welcome: {
    color: 'text-[#35D07F]',
    bg: 'bg-[#35D07F]/6',
    border: 'border-l-[#35D07F]',
    label: 'WELCOME',
    icon: '👋',
  },
  ticket_purchase: {
    color: 'text-[#35D07F]',
    bg: 'bg-[#35D07F]/6',
    border: 'border-l-[#35D07F]',
    label: 'PURCHASE',
    icon: '🎟️',
  },
  draw_start: {
    color: 'text-[#FCFF52]',
    bg: 'bg-[#FCFF52]/6',
    border: 'border-l-[#FCFF52]',
    label: 'DRAW',
    icon: '🎰',
  },
  winner_announced: {
    color: 'text-[#FFD700]',
    bg: 'bg-[#FFD700]/6',
    border: 'border-l-[#FFD700]',
    label: 'WINNER',
    icon: '🏆',
  },
  commentary: {
    color: 'text-[#8B5CF6]',
    bg: 'bg-[#8B5CF6]/6',
    border: 'border-l-[#8B5CF6]',
    label: 'ARIA',
    icon: '🤖',
  },
};

const DEFAULT_CONFIG = {
  color: 'text-white/40',
  bg: 'bg-white/4',
  border: 'border-l-white/20',
  label: 'MSG',
  icon: '💬',
};

export function AgentPanel({ messages, isThinking }: AgentPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="game-card card-accent-purple glow-purple flex flex-col"
      style={{ minHeight: '360px' }}
    >
      {/* Purple glow blob */}
      <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-[#8B5CF6]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-7 flex flex-col h-full">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center pulse-ring-purple">
              <BrainCircuit size={18} className="text-[#8B5CF6]" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#35D07F] border-2 border-[#0A0A1A] blink-dot" />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-display text-sm font-bold text-white tracking-wide"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              ARIA
            </h3>
            <p
              className="text-[10px] font-label text-[#8B5CF6]/60 tracking-wider truncate"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Autonomous Raffle Intelligence Agent
            </p>
          </div>

          {isThinking && (
            <div className="flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── ERC-8004 badge ── */}
        <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-[#8B5CF6]/8 border border-[#8B5CF6]/18">
          <Zap size={11} className="text-[#8B5CF6] shrink-0" />
          <span
            className="text-[10px] font-label text-[#8B5CF6]/70 tracking-wider flex-1 truncate"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            ERC-8004 REGISTERED · ON-CHAIN IDENTITY
          </span>
          <Cpu size={11} className="text-[#8B5CF6]/40 shrink-0" />
        </div>

        {/* ── Message feed ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1"
          style={{ maxHeight: '280px' }}
        >
          <AnimatePresence initial={false}>
            {messages.length === 0 && !isThinking ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/8 border border-[#8B5CF6]/15 flex items-center justify-center">
                  <Bot size={22} className="text-[#8B5CF6]/40" />
                </div>
                <p
                  className="text-[11px] font-label text-white/20 tracking-widest text-center"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  ARIA IS MONITORING THE RAFFLE...
                </p>
              </motion.div>
            ) : (
              messages.map((msg) => {
                const cfg = EVENT_CONFIG[msg.event] ?? DEFAULT_CONFIG;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -12, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                    className={`rounded-lg border-l-2 px-3 py-2.5 ${cfg.bg} ${cfg.border} overflow-hidden`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px]">{cfg.icon}</span>
                      <span
                        className={`text-[9px] font-label font-bold tracking-widest ${cfg.color}`}
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        {cfg.label}
                      </span>
                      <span
                        className="ml-auto text-[9px] font-label text-white/15 tracking-wider shrink-0"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                    <p
                      className="text-[11px] font-body text-white/60 leading-relaxed"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {msg.text}
                    </p>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

          {/* Thinking bubble */}
          {isThinking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border-l-2 border-l-[#8B5CF6] bg-[#8B5CF6]/6 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px]">🤖</span>
                <span
                  className="text-[9px] font-label font-bold tracking-widest text-[#8B5CF6]"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  PROCESSING
                </span>
                <div className="flex gap-1 ml-2">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="w-1 h-1 rounded-full bg-[#8B5CF6]"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
              <p
                className="text-[11px] font-body text-white/30 mt-1 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                ARIA is composing a response...
              </p>
            </motion.div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#35D07F] blink-dot" />
          <span
            className="text-[10px] font-label text-white/20 tracking-widest"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            GEMINI AI · POWERED
          </span>
          <div className="ml-auto flex items-center gap-1">
            <span
              className="text-[10px] font-label text-white/15 tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {messages.length} EVENTS
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
