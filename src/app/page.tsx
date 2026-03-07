'use client';

import { useEffect, useRef } from 'react';
import { initGame } from '@/game';

export default function Home() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gameInstance: any = null;
    if (gameRef.current) {
      initGame(gameRef.current).then(game => {
        gameInstance = game;
      });

      return () => {
        if (gameInstance) {
          gameInstance.destroy(true);
        }
      };
    }
  }, []);

  return (
    <main className="w-screen h-screen m-0 p-0 overflow-hidden bg-[#11111B]">
      <div ref={gameRef} id="game-container" className="w-full h-full" />
    </main>
  );
}
