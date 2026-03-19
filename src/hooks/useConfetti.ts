'use client';

import { useCallback } from 'react';

export function useConfetti() {
  const fire = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default;

    const count = 300;
    const defaults = { origin: { y: 0.7 } };

    function particleBurst(options: object) {
      confetti({ ...defaults, ...options });
    }

    particleBurst({ spread: 26, startVelocity: 55, particleCount: Math.floor(count * 0.25) });
    particleBurst({ spread: 60, particleCount: Math.floor(count * 0.2) });
    particleBurst({ spread: 100, decay: 0.91, scalar: 0.8, particleCount: Math.floor(count * 0.35) });
    particleBurst({ spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, particleCount: Math.floor(count * 0.1) });
    particleBurst({ spread: 120, startVelocity: 45, particleCount: Math.floor(count * 0.1) });

    // Gold and green (Celo colors)
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FCFF52', '#35D07F', '#FB7C6D', '#ffffff'],
      });
    }, 400);
  }, []);

  return { fire };
}
