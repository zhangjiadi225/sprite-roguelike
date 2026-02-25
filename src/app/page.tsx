'use client';

import { useEffect, useRef } from 'react';
import { initGame } from '@/game';

export default function Home() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current) {
      const game = initGame(gameRef.current);
      
      return () => {
        game.destroy(true);
      };
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <div ref={gameRef} id="game-container" />
    </main>
  );
}
