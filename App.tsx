import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameUI from './components/GameUI';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import Unit from './components/Unit';
import { GAME_CONFIG, AGES } from './constants';
import type { GameState } from './types';
import { GameStatus } from './types';
import { GameManager } from './GameManager';

const App: React.FC = () => {
  const gameManagerRef = useRef<GameManager | null>(null);

  const [gameState, setGameState] = useState<GameState>(() => {
    const manager = new GameManager();
    gameManagerRef.current = manager;
    return manager.getState();
  });

  // Link the GameManager to the React state updater after the initial render.
  useEffect(() => {
    if (gameManagerRef.current) {
      gameManagerRef.current.setOnStateUpdate(setGameState);
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(performance.now());

  const gameLoop = useCallback(() => {
    if (!gameManagerRef.current) return;
    
    const now = performance.now();
    const deltaTime = (now - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = now;

    gameManagerRef.current.update(deltaTime, now);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (gameState.status === GameStatus.Playing) {
      lastUpdateTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameLoop]);

  const handleStart = () => gameManagerRef.current?.start();
  const handleRestart = () => gameManagerRef.current?.restart();
  const handleSpawnUnit = (unitIndex: number) => gameManagerRef.current?.spawnPlayerUnit(unitIndex);
  const handleEvolve = () => gameManagerRef.current?.evolvePlayer();
  const handleUpgrade = (upgradeIndex: number) => gameManagerRef.current?.upgradePlayer(upgradeIndex);

  const currentAge = AGES[gameState.playerAge];
  const currentBackground = AGES[gameState.playerAge].background;
  const playerBaseImg = AGES[gameState.playerAge].baseImage;
  const aiBaseImg = AGES[gameState.aiAge].baseImage;
  const canEvolve = gameState.playerAge < AGES.length - 1 && gameState.playerXP >= currentAge.xpToEvolve;

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div
        className="relative overflow-hidden bg-cover bg-center"
        style={{
          width: `${GAME_CONFIG.GAME_WIDTH}px`,
          height: `${GAME_CONFIG.GAME_HEIGHT}px`,
          backgroundImage: `url(${currentBackground})`,
        }}
      >
        {gameState.status === GameStatus.StartScreen && <StartScreen onStart={handleStart} />}
        {gameState.status === GameStatus.GameOver && <GameOverScreen winner={gameState.winner} onRestart={handleRestart} />}
        
        {gameState.status !== GameStatus.StartScreen && (
          <>
            <GameUI
              playerGold={gameState.playerGold}
              playerXP={gameState.playerXP}
              playerHealth={gameState.playerHealth}
              aiHealth={gameState.aiHealth}
              currentAge={currentAge}
              maxHealth={GAME_CONFIG.MAX_HEALTH}
              canEvolve={canEvolve}
              purchasedUpgrades={gameState.playerUpgrades}
              onSpawnUnit={handleSpawnUnit}
              onEvolve={handleEvolve}
              onUpgrade={handleUpgrade}
            />

            {/* Bases */}
            <img src={playerBaseImg} alt="Player Base" className="absolute bottom-12 h-48" style={{ left: `${GAME_CONFIG.PLAYER_BASE_X - 100}px`}}/>
            <img src={aiBaseImg} alt="AI Base" className="absolute bottom-12 h-48 scale-x-[-1]" style={{ left: `${GAME_CONFIG.AI_BASE_X - 60}px`}}/>

            {/* Units */}
            {gameState.units.map(unit => (
              <Unit key={unit.id} unit={unit} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default App;