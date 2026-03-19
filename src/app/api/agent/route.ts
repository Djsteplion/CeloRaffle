import { NextRequest, NextResponse } from 'next/server';
import { getAgentCommentary, RaffleContext } from '@/lib/agent';

export async function POST(request: NextRequest) {
  try {
    const context: RaffleContext = await request.json();
    const commentary = await getAgentCommentary(context);
    return NextResponse.json({ commentary });
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { commentary: 'Agent is processing blockchain data...', error: true },
      { status: 200 }
    );
  }
}
