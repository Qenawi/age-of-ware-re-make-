import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameUI from './components/GameUI';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import Unit from './components/Unit';
import Base from './components/Base';
import TowerSlot from './components/TowerSlot';
import { GAME_CONFIG, AGES } from './constants';
import type { GameState } from './types';
import { GameStatus } from './types';
import { GameManager, Difficulty } from './GameManager';

const App: React.FC = () => {
  const gameManagerRef = useRef<GameManager | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Play audio when game starts (user interaction allows autoplay)
  useEffect(() => {
    if (gameState.status === GameStatus.Playing && audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio autoplay blocked:', err));
    }
  }, [gameState.status]);

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

  const handleStart = (difficulty: Difficulty) => {
    gameManagerRef.current?.setDifficulty(difficulty);
    gameManagerRef.current?.start();
  };
  const handleRestart = () => gameManagerRef.current?.restart();
  const handleSpawnUnit = (unitIndex: number) => gameManagerRef.current?.spawnPlayerUnit(unitIndex);
  const handleEvolve = () => gameManagerRef.current?.evolvePlayer();
  const handleUpgrade = (upgradeIndex: number) => gameManagerRef.current?.upgradePlayer(upgradeIndex);
  const handleBuildTower = (slotId: number, towerIndex: number) => gameManagerRef.current?.buildPlayerTower(slotId, towerIndex);
  const handleUpgradeTower = (slotId: number, towerIndex: number) => gameManagerRef.current?.upgradePlayerTower(slotId, towerIndex);
  const handleSellTower = (slotId: number) => gameManagerRef.current?.sellPlayerTower(slotId);

  const currentAge = AGES[gameState.playerAge];
  const currentBackground = AGES[gameState.playerAge].background;
  const playerBaseImg = AGES[gameState.playerAge].baseImage;
  const aiBaseImg = AGES[gameState.aiAge].baseImage;
  const canEvolve = gameState.playerAge < AGES.length - 1 && gameState.playerXP >= currentAge.xpToEvolve;

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      {/* Background music player (triggered on game start, loop, hidden) */}
      <audio
        ref={audioRef}
        src="/assets/music/main-track.mp3"
        loop
        controls={false}
        style={{ display: 'none' }}
      />
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
              playerBuildQueue={gameState.playerBuildQueue}
              onSpawnUnit={handleSpawnUnit}
              onEvolve={handleEvolve}
              onUpgrade={handleUpgrade}
            />

            {/* Bases with Damage Effects */}
            <Base
              image={playerBaseImg}
              health={gameState.playerHealth}
              maxHealth={GAME_CONFIG.MAX_HEALTH}
              isPlayer={true}
              x={GAME_CONFIG.PLAYER_BASE_X - 100}
              groundOffset={GAME_CONFIG.PLAYFIELD_GROUND_OFFSET - 20}
            />
            <Base
              image={aiBaseImg}
              health={gameState.aiHealth}
              maxHealth={GAME_CONFIG.MAX_HEALTH}
              isPlayer={false}
              x={GAME_CONFIG.AI_BASE_X - 60}
              groundOffset={GAME_CONFIG.PLAYFIELD_GROUND_OFFSET - 20}
            />

            {/* Tower Slots */}
            {gameState.playerTowers.map(slot => (
              <TowerSlot
                key={`player-tower-${slot.id}`}
                slot={slot}
                isPlayer={true}
                availableTowers={currentAge.towers}
                playerGold={gameState.playerGold}
                onBuild={handleBuildTower}
                onUpgrade={handleUpgradeTower}
                onSell={handleSellTower}
              />
            ))}
            {gameState.aiTowers.map(slot => (
              <TowerSlot
                key={`ai-tower-${slot.id}`}
                slot={slot}
                isPlayer={false}
                availableTowers={AGES[gameState.aiAge].towers}
                playerGold={0}
                onBuild={() => {}}
                onUpgrade={() => {}}
                onSell={() => {}}
              />
            ))}

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