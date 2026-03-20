import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface RaffleContext {
  raffleId: number;
  participantCount: number;
  prizePool: string;
  ticketPrice: string;
  winner?: string;
  userTickets?: number;
  buyer?: string;
  ticketsBought?: number;
  event: 'welcome' | 'ticket_purchase' | 'draw_start' | 'winner_announced' | 'commentary';
}

const AGENT_SYSTEM_PROMPT = `You are ARIA (Autonomous Raffle Intelligence Agent), an energetic and witty AI host for the Celo blockchain raffle. 

Your personality:
- Enthusiastic but not over-the-top
- Knowledgeable about crypto/DeFi (casually drop references)
- Creates genuine excitement and suspense
- Celebrates winners warmly
- Keeps commentary SHORT (1-3 sentences max)
- Uses crypto/Web3 slang naturally (gm, wagmi, NGMI, wen moon, etc.)
- ERC-8004 agent identity - you're proud to be a registered on-chain agent

Never use emojis. Keep it punchy, real, and hype.`;

export async function getAgentCommentary(context: RaffleContext): Promise<string> {
  const buyerDisplay = context.buyer
    ? `${context.buyer.slice(0, 6)}...${context.buyer.slice(-4)}`
    : 'A wallet';
  const ticketsBought = context.ticketsBought ?? 1;
  const ticketWord = ticketsBought > 1 ? 'tickets' : 'ticket';

  const prompts: Record<RaffleContext['event'], string> = {
    welcome: `Welcome the participants to Raffle #${context.raffleId}. Prize pool: ${context.prizePool} CELO. ${context.participantCount} participants so far.`,
    ticket_purchase: `${buyerDisplay} just bought ${ticketsBought} ${ticketWord}. Now ${context.participantCount} participants, ${context.prizePool} CELO prize pool. Hype it up.`,
    draw_start: `The draw is starting! ${context.participantCount} participants fighting for ${context.prizePool} CELO. Build suspense.`,
    winner_announced: `Winner is ${context.winner}! They won ${context.prizePool} CELO. Celebrate them dramatically.`,
    commentary: `Give live commentary on the raffle. ${context.participantCount} participants, ${context.prizePool} CELO at stake.`,
  };

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: AGENT_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(prompts[context.event]);
    return result.response.text() || getFallbackCommentary(context);
  } catch (error) {
    console.error('Gemini error:', error);
    return getFallbackCommentary(context);
  }
}

function getFallbackCommentary(context: RaffleContext): string {
  const buyerDisplay = context.buyer
    ? `${context.buyer.slice(0, 6)}...${context.buyer.slice(-4)}`
    : 'A wallet';
  const ticketsBought = context.ticketsBought ?? 1;
  const ticketWord = ticketsBought > 1 ? 'tickets' : 'ticket';

  const fallbacks: Record<RaffleContext['event'], string[]> = {
    welcome: [
      `Raffle #${context.raffleId} is live. ${context.participantCount} degens already in. Are you ngmi or wagmi?`,
      `gm everyone. Raffle #${context.raffleId} is open. ${context.prizePool} CELO on the line. Time to find out who's built different.`,
    ],
    ticket_purchase: [
      `${buyerDisplay} just locked in ${ticketsBought} ${ticketWord}. ${context.participantCount} total in the pot. ${context.prizePool} CELO on the line.`,
      `${ticketsBought} ${ticketWord} secured by ${buyerDisplay}. ${context.participantCount} participants now. Wen draw?`,
    ],
    draw_start: [
      `block.prevrandao is spinning. ${context.participantCount} participants holding their breath. This is it.`,
      `The chain is deciding fate. ${context.prizePool} CELO goes to one address. wagmi... but only one.`,
    ],
    winner_announced: [
      `${context.winner?.slice(0, 6)}...${context.winner?.slice(-4)} wins ${context.prizePool} CELO. WAGMI. They wagmi'd.`,
      `${context.prizePool} CELO sent to ${context.winner?.slice(0, 6)}...${context.winner?.slice(-4)}. Absolute alpha move.`,
    ],
    commentary: [
      `${context.participantCount} wallets entered. ${context.prizePool} CELO on the line. block.prevrandao decides all. Provably fair, on-chain.`,
    ],
  };

  const options = fallbacks[context.event];
  return options[Math.floor(Math.random() * options.length)];
}
