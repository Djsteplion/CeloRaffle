'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useWatchContractEvent, useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useRaffle, RaffleState } from '@/hooks/useRaffle';
import { useAgent } from '@/hooks/useAgent';
import { PrizePool } from '@/components/PrizePool';
import { TicketPurchase } from '@/components/TicketPurchase';
import { LiveDraw } from '@/components/LiveDraw';
import { AgentPanel } from '@/components/AgentPanel';
import { AdminPanel } from '@/components/AdminPanel';
import { WinnerAnnouncement } from '@/components/WinnerAnnouncement';
import { CONTRACT_ADDRESS, RAFFLE_ABI } from '@/lib/contracts';
import { motion } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';

const IS_DEMO = !process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000';

const DEMO_TICKET_PRICE = parseEther('0.01');
const DEMO_PRIZE_POOL = parseEther('0.04');

export function RaffleApp() {
  const {
    raffleInfo,
    currentWinner,
    rafflePrizeAmount,
    userTickets,
    participants,
    celoBalance,
    purchaseTickets,
    requestDraw,
    startNewRaffle,
    refetchAll,
    isPending,
    isTxSuccess,
    txHash,
    lastActionRef,
    isConnected,
  } = useRaffle();

  const { address } = useAccount();
  const { messages, isThinking, addMessage } = useAgent();

  const [winner, setWinner] = useState<string | null>(null);
  const [winnerPrize, setWinnerPrize] = useState<bigint | null>(null);
  const [winnerTxHash, setWinnerTxHash] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [demoParticipants] = useState<`0x${string}`[]>([
    '0x1234567890123456789012345678901234567890',
    '0xabcdef1234567890abcdef1234567890abcdef12',
    '0x9876543210987654321098765432109876543210',
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  ]);

  const prevStateRef = useRef<RaffleState | null>(null);
  const welcomeSentRef = useRef(false);
  const purchasedTicketsRef = useRef<number>(0);
  const purchaseCommentaryFiredRef = useRef(false);
  const pendingPurchaseRef = useRef<{ buyer: string | undefined; ticketsBought: number } | null>(null);
  const winnerAnnouncedRef = useRef(false);

  // Watch for WinnerSelected event
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: 'WinnerSelected',
    onLogs(logs) {
      const log = logs[0];
      if (log.args.winner && log.args.prize) {
        winnerAnnouncedRef.current = true;
        setWinner(log.args.winner);
        setWinnerPrize(log.args.prize);
        setWinnerTxHash(log.transactionHash ?? null);
        setShowWinner(true);
        refetchAll();
        addMessage({
          raffleId: Number(raffleInfo?.raffleId ?? 1),
          participantCount: Number(raffleInfo?.participantCount ?? 0),
          prizePool: formatEther(log.args.prize ?? 0n),
          ticketPrice: formatEther(raffleInfo?.ticketPrice ?? DEMO_TICKET_PRICE),
          winner: log.args.winner,
          event: 'winner_announced',
        });
      }
    },
  });

  // Watch for OTHER people's TicketPurchased events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_ABI,
    eventName: 'TicketPurchased',
    onLogs(logs) {
      refetchAll();
      const log = logs[0];
      const buyer = log.args.buyer as string;
      if (address && buyer.toLowerCase() === address.toLowerCase()) return;
      if (raffleInfo) {
        addMessage({
          raffleId: Number(raffleInfo.raffleId),
          participantCount: Number(raffleInfo.participantCount) + 1,
          prizePool: formatEther(raffleInfo.prizePool),
          ticketPrice: formatEther(raffleInfo.ticketPrice),
          event: 'ticket_purchase',
          buyer,
          ticketsBought: Number(log.args.amount ?? 1),
        });
      }
    },
  });

  // After purchase tx succeeds, store pending message and trigger refetch
  useEffect(() => {
    if (!isTxSuccess) return;
    if (lastActionRef.current !== 'purchase') return;
    if (purchaseCommentaryFiredRef.current) return;
    purchaseCommentaryFiredRef.current = true;
    pendingPurchaseRef.current = {
      buyer: address,
      ticketsBought: purchasedTicketsRef.current,
    };
    setTimeout(() => refetchAll(), 1500);
  }, [isTxSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Once raffleInfo updates AND we have a pending purchase message, fire it
  useEffect(() => {
    if (!pendingPurchaseRef.current) return;
    if (!raffleInfo) return;
    const pending = pendingPurchaseRef.current;
    pendingPurchaseRef.current = null;
    addMessage({
      raffleId: Number(raffleInfo.raffleId),
      participantCount: Number(raffleInfo.participantCount),
      prizePool: formatEther(raffleInfo.prizePool),
      ticketPrice: formatEther(raffleInfo.ticketPrice),
      event: 'ticket_purchase',
      buyer: pending.buyer,
      ticketsBought: pending.ticketsBought,
    });
  }, [raffleInfo, addMessage]);

  // Welcome message on load
  useEffect(() => {
    if (welcomeSentRef.current) return;
    if (!raffleInfo && !IS_DEMO) return;
    welcomeSentRef.current = true;
    const timer = setTimeout(() => {
      addMessage({
        raffleId: Number(raffleInfo?.raffleId ?? 1),
        participantCount: Number(raffleInfo?.participantCount ?? 0),
        prizePool: formatEther(raffleInfo?.prizePool ?? DEMO_PRIZE_POOL),
        ticketPrice: formatEther(raffleInfo?.ticketPrice ?? DEMO_TICKET_PRICE),
        event: 'welcome',
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [addMessage, raffleInfo]);

  // Watch state changes for draw commentary
  useEffect(() => {
    if (!raffleInfo) return;
    const currentState = raffleInfo.state;
    if (prevStateRef.current !== null && prevStateRef.current !== currentState) {
      if (currentState === RaffleState.DRAWING) {
        addMessage({
          raffleId: Number(raffleInfo.raffleId),
          participantCount: Number(raffleInfo.participantCount),
          prizePool: formatEther(raffleInfo.prizePool),
          ticketPrice: formatEther(raffleInfo.ticketPrice),
          event: 'draw_start',
        });
      }
      // Fallback: catch winner from raffleInfo when state changes to CLOSED
      // in case WinnerSelected event was missed
      if (currentState === RaffleState.CLOSED && !winnerAnnouncedRef.current) {
        refetchAll();
        setTimeout(() => refetchAll(), 2000);
      }
    }
    prevStateRef.current = currentState;
  }, [raffleInfo, addMessage, refetchAll]);

  // Refetch after tx success
  useEffect(() => {
    if (isTxSuccess) {
      const timer = setTimeout(() => {
        refetchAll();
        purchaseCommentaryFiredRef.current = false;
        // If draw tx, keep refetching to catch winner
        if (lastActionRef.current === 'draw') {
          setTimeout(() => refetchAll(), 3000);
          setTimeout(() => refetchAll(), 6000);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isTxSuccess, refetchAll, lastActionRef]);

  // Fallback winner detection from contract read (in case event listener missed it)
  useEffect(() => {
    if (!raffleInfo) return;
    if (raffleInfo.state !== RaffleState.CLOSED) return;
    if (winnerAnnouncedRef.current) return;
    if (winner) return;
    // State is CLOSED but we have no winner — query it directly
    winnerAnnouncedRef.current = true;
    refetchAll();
  }, [raffleInfo, winner, refetchAll]);

  // Fallback: use currentWinner from contract read to show popup
  useEffect(() => {
    if (!raffleInfo) return;
    if (raffleInfo.state !== RaffleState.CLOSED) return;
    if (winner) return;
    if (!currentWinner || currentWinner === '0x0000000000000000000000000000000000000000') return;
    winnerAnnouncedRef.current = true;
    setWinner(currentWinner);
    // Use rafflePrizeAmount from mapping (preserved after payout) instead of
    // raffleInfo.prizePool which resets to 0 once funds are sent
    setWinnerPrize(rafflePrizeAmount ?? raffleInfo.prizePool);
    setShowWinner(true);
    addMessage({
      raffleId: Number(raffleInfo.raffleId),
      participantCount: Number(raffleInfo.participantCount),
      prizePool: formatEther(rafflePrizeAmount ?? raffleInfo.prizePool),
      ticketPrice: formatEther(raffleInfo.ticketPrice),
      winner: currentWinner,
      event: 'winner_announced',
    });
  }, [raffleInfo, currentWinner, rafflePrizeAmount, winner, addMessage]);

  const handlePurchase = useCallback((numTickets: number) => {
    purchasedTicketsRef.current = numTickets;
    purchaseCommentaryFiredRef.current = false;
    pendingPurchaseRef.current = null;
    purchaseTickets(numTickets);
  }, [purchaseTickets]);

  const handleRequestDraw = useCallback(() => {
    winnerAnnouncedRef.current = false;
    requestDraw();
    addMessage({
      raffleId: Number(raffleInfo?.raffleId ?? 1),
      participantCount: Number(raffleInfo?.participantCount ?? 0),
      prizePool: formatEther(raffleInfo?.prizePool ?? DEMO_PRIZE_POOL),
      ticketPrice: formatEther(raffleInfo?.ticketPrice ?? DEMO_TICKET_PRICE),
      event: 'draw_start',
    });
  }, [requestDraw, addMessage, raffleInfo]);

  const handleStartNewRaffle = useCallback(() => {
    winnerAnnouncedRef.current = false;
    startNewRaffle();
  }, [startNewRaffle]);

  const displayParticipants = IS_DEMO ? demoParticipants : participants;
  const displayRaffleInfo = IS_DEMO ? {
    raffleId: BigInt(1),
    state: RaffleState.OPEN,
    participantCount: BigInt(demoParticipants.length),
    prizePool: DEMO_PRIZE_POOL,
    ticketPrice: DEMO_TICKET_PRICE,
  } : raffleInfo;

  return (
    <div className="min-h-screen pt-20">
      {IS_DEMO && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-4 mb-4 mt-2 bg-[#FCFF52]/10 border border-[#FCFF52]/30 rounded-xl p-3 flex items-start gap-2 max-w-7xl"
        >
          <Info size={14} className="text-[#FCFF52] mt-0.5 shrink-0" />
          <p className="text-xs font-mono text-[#FCFF52]/80">
            <span className="font-bold">Demo Mode</span> — Contract not deployed. Set{' '}
            <code className="bg-black/50 px-1 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in{' '}
            <code className="bg-black/50 px-1 rounded">.env.local</code> after running{' '}
            <code className="bg-black/50 px-1 rounded">npm run deploy</code>.
          </p>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PrizePool raffleInfo={displayRaffleInfo} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TicketPurchase
                raffleInfo={displayRaffleInfo}
                userTickets={userTickets}
                celoBalance={celoBalance}
                isConnected={isConnected}
                isPending={isPending}
                isTxSuccess={isTxSuccess}
                onPurchase={handlePurchase}
              />
              <LiveDraw
                participants={displayParticipants as `0x${string}`[]}
                raffleState={displayRaffleInfo?.state ?? RaffleState.OPEN}
                winner={winner || undefined}
              />
            </div>

            {(IS_DEMO || isConnected) && (
              <AdminPanel
                raffleState={displayRaffleInfo?.state ?? RaffleState.OPEN}
                participantCount={Number(displayRaffleInfo?.participantCount ?? 0)}
                onRequestDraw={handleRequestDraw}
                onStartNewRaffle={handleStartNewRaffle}
                isPending={isPending}
              />
            )}

            {txHash && (
              <motion.a
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                href={`https://sepolia.celoscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
              >
                <ExternalLink size={12} />
                View transaction on Celoscan
              </motion.a>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AgentPanel messages={messages} isThinking={isThinking} />
            </div>
          </div>
        </div>
      </div>

      {showWinner && (
        <WinnerAnnouncement
          winner={winner}
          txHash={winnerTxHash}
          prize={winnerPrize}
          raffleId={raffleInfo?.raffleId ?? null}
          onClose={() => setShowWinner(false)}
        />
      )}
    </div>
  );
}