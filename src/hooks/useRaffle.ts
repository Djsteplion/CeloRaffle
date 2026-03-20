'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { useCallback, useRef } from 'react';
import { CONTRACT_ADDRESS, RAFFLE_ABI } from '@/lib/contracts';

export enum RaffleState {
  OPEN = 0,
  DRAWING = 1,
  CLOSED = 2,
}

export interface RaffleInfo {
  raffleId: bigint;
  state: RaffleState;
  participantCount: bigint;
  prizePool: bigint;
  ticketPrice: bigint;
}

export type TxAction = 'purchase' | 'draw' | 'new_raffle' | null;

export function useRaffle() {
  const { address } = useAccount();
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const lastActionRef = useRef<TxAction>(null);

  // Read raffle info
  const { data: raffleInfo, refetch: refetchRaffleInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: 'getRaffleInfo',
    query: { refetchInterval: 5000 },
  });

  // Read user tickets
  const { data: userTickets, refetch: refetchUserTickets } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: 'getUserTickets',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Read participants
  const { data: participants, refetch: refetchParticipants } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: 'getParticipants',
    query: { refetchInterval: 5000 },
  });

  // Read native CELO balance
  const { data: celoBalance } = useBalance({
    address,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  // Read current raffle winner directly from contract (fallback for missed events)
  const parsedRaffleId = raffleInfo ? raffleInfo[0] : undefined;
  const { data: currentWinner, refetch: refetchWinner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: 'raffleWinner',
    args: parsedRaffleId !== undefined ? [parsedRaffleId] : undefined,
    query: { enabled: parsedRaffleId !== undefined, refetchInterval: 5000 },
  });

  // Read raffle prize pool from contract mapping (preserves amount even after payout)
  const { data: rafflePrizeAmount, refetch: refetchRafflePrize } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_ABI,
    functionName: 'rafflePrizePool',
    args: parsedRaffleId !== undefined ? [parsedRaffleId] : undefined,
    query: { enabled: parsedRaffleId !== undefined, refetchInterval: 5000 },
  });

  // Wait for tx
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Purchase tickets with native CELO
  const purchaseTickets = useCallback(async (numTickets: number) => {
    const ticketPrice = raffleInfo ? raffleInfo[4] : parseEther('0.01');
    const totalCost = ticketPrice * BigInt(numTickets);
    lastActionRef.current = 'purchase';
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: RAFFLE_ABI,
      functionName: 'purchaseTickets',
      args: [BigInt(numTickets)],
      value: totalCost,
    });
  }, [writeContract, raffleInfo]);

  // Request draw (owner only)
  const requestDraw = useCallback(() => {
    lastActionRef.current = 'draw';
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: RAFFLE_ABI,
      functionName: 'requestDraw',
    });
  }, [writeContract]);

  // Start new raffle (owner only)
  const startNewRaffle = useCallback(() => {
    lastActionRef.current = 'new_raffle';
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: RAFFLE_ABI,
      functionName: 'startNewRaffle',
    });
  }, [writeContract]);

  const refetchAll = useCallback(() => {
    refetchRaffleInfo();
    refetchUserTickets();
    refetchParticipants();
    refetchWinner();
    refetchRafflePrize();
  }, [refetchRaffleInfo, refetchUserTickets, refetchParticipants, refetchWinner, refetchRafflePrize]);

  // Parse raffle info
  const parsedRaffleInfo: RaffleInfo | null = raffleInfo
    ? {
        raffleId: raffleInfo[0],
        state: raffleInfo[1] as RaffleState,
        participantCount: raffleInfo[2],
        prizePool: raffleInfo[3],
        ticketPrice: raffleInfo[4],
      }
    : null;

  return {
    raffleInfo: parsedRaffleInfo,
    userTickets: userTickets ? Number(userTickets) : 0,
    participants: participants || [],
    celoBalance: celoBalance ? parseFloat(celoBalance.formatted).toFixed(4) : '0',
    currentWinner: currentWinner as `0x${string}` | undefined,
    rafflePrizeAmount: rafflePrizeAmount as bigint | undefined,
    purchaseTickets,
    requestDraw,
    startNewRaffle,
    refetchAll,
    isPending: isPending || isTxLoading,
    isTxSuccess,
    txHash,
    lastActionRef,
    writeError,
    isConnected: !!address,
    address,
  };
}