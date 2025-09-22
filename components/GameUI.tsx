import React from 'react';
import type { Age, Upgrade } from '../types';

interface GameUIProps {
  playerGold: number;
  playerXP: number;
  playerHealth: number;
  aiHealth: number;
  currentAge: Age;
  maxHealth: number;
  canEvolve: boolean;
  purchasedUpgrades: string[];
  onSpawnUnit: (unitIndex: number) => void;
  onEvolve: () => void;
  onUpgrade: (upgradeIndex: number) => void;
}

const HealthBar: React.FC<{ current: number; max: number; isPlayer: boolean }> = ({ current, max, isPlayer }) => {
  const percentage = (current / max) * 100;
  const bgColor = isPlayer ? 'bg-green-500' : 'bg-red-500';
  const flexDirection = isPlayer ? 'flex-row' : 'flex-row-reverse';

  return (
    <div className={`relative w-1/3 h-8 bg-gray-700 rounded overflow-hidden border-2 border-gray-500 flex ${flexDirection}`}>
      <div className={`${bgColor} h-full transition-all duration-300 ease-linear`} style={{ width: `${percentage}%` }}></div>
      <span className="absolute w-full text-center font-bold text-white text-shadow">{Math.round(current)} / {max}</span>
    </div>
  );
};

const GameUI: React.FC<GameUIProps> = ({
  playerGold,
  playerXP,
  playerHealth,
  aiHealth,
  currentAge,
  maxHealth,
  canEvolve,
  purchasedUpgrades,
  onSpawnUnit,
  onEvolve,
  onUpgrade,
}) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="p-2 flex justify-between items-center bg-gray-900 bg-opacity-50">
        <HealthBar current={playerHealth} max={maxHealth} isPlayer={true} />
        <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">💰 {Math.floor(playerGold)}</div>
            <div className="text-2xl font-bold text-blue-400">⭐ {Math.floor(playerXP)} / {currentAge.xpToEvolve}</div>
        </div>
        <HealthBar current={aiHealth} max={maxHealth} isPlayer={false} />
      </div>
      
      <div className="absolute bottom-0 left-0 w-full p-2 bg-gray-800 bg-opacity-70 flex justify-center items-center space-x-2 pointer-events-auto">
        {/* Unit Spawning */}
        {currentAge.units.map((unit, index) => (
          <button
            key={unit.name}
            onClick={() => onSpawnUnit(index)}
            disabled={playerGold < unit.cost}
            className="p-2 bg-gray-700 rounded-lg border-2 border-gray-500 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex flex-col items-center w-24"
          >
            <img src={unit.icon} alt={unit.name} className="h-12 w-12 object-contain" />
            <span className="font-bold text-sm">{unit.name}</span>
            <span className="text-xs text-yellow-400">💰 {unit.cost}</span>
          </button>
        ))}
        
        <div className="w-px h-20 bg-gray-500 mx-2"></div>
        
        {/* Upgrades */}
        <div className="flex space-x-2">
            {currentAge.upgrades.map((upgrade, index) => {
                const isPurchased = purchasedUpgrades.includes(upgrade.name);
                return (
                    <button
                        key={upgrade.name}
                        onClick={() => onUpgrade(index)}
                        disabled={playerXP < upgrade.cost || isPurchased}
                        className="p-2 bg-gray-700 rounded-lg border-2 border-gray-500 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex flex-col items-center w-28 text-center"
                        title={upgrade.description}
                    >
                        <span className="font-bold text-sm">{upgrade.name}</span>
                        <span className="text-xs mt-1">{upgrade.description}</span>
                        <span className={`text-xs mt-1 ${isPurchased ? 'text-green-400' : 'text-blue-400'}`}>
                            {isPurchased ? 'PURCHASED' : `⭐ ${upgrade.cost}`}
                        </span>
                    </button>
                )
            })}
        </div>
        
        <div className="w-px h-20 bg-gray-500 mx-2"></div>

        {/* Evolve */}
        <button
          onClick={onEvolve}
          disabled={!canEvolve}
          className="p-2 bg-purple-700 rounded-lg border-2 border-purple-500 hover:bg-purple-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex flex-col items-center w-28 h-24 justify-center"
        >
          <span className="text-4xl">⭐</span>
          <span className="font-bold">EVOLVE</span>
          <span className="text-xs text-blue-300">{currentAge.xpToEvolve} XP</span>
        </button>
      </div>
    </div>
  );
};

export default GameUI;