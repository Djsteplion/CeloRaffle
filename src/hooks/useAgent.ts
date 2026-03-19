'use client';

import { useState, useCallback } from 'react';
import { RaffleContext } from '@/lib/agent';

interface AgentMessage {
  id: string;
  text: string;
  timestamp: number;
  event: RaffleContext['event'];
}

export function useAgent() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const addMessage = useCallback(async (context: RaffleContext) => {
    setIsThinking(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      const data = await response.json();
      const message: AgentMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text: data.commentary,
        timestamp: Date.now(),
        event: context.event,
      };

      setMessages(prev => [message, ...prev].slice(0, 10)); // Keep last 10
    } catch (error) {
      console.error('Agent error:', error);
    } finally {
      setIsThinking(false);
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isThinking, addMessage, clearMessages };
}
