import React from 'react';
import type { Age, Upgrade, BuildQueueItem, UnitStats } from '../types';

interface GameUIProps {
  playerGold: number;
  playerXP: number;
  playerHealth: number;
  aiHealth: number;
  currentAge: Age;
  maxHealth: number;
  canEvolve: boolean;
  purchasedUpgrades: string[];
  playerBuildQueue: BuildQueueItem[];
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
  playerBuildQueue,
  onSpawnUnit,
  onEvolve,
  onUpgrade,
}) => {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* Compact Header: Health, Gold, XP, Era Progress */}
      <div className={`px-2 py-1 flex ${isMobile ? 'flex-col' : 'justify-between'} items-center bg-gray-900 bg-opacity-60 gap-2 rounded-b-lg`}>
        <HealthBar current={playerHealth} max={maxHealth} isPlayer={true} />
        <div className={`flex flex-col items-center ${isMobile ? 'my-1' : 'mx-2'}`}>
          <div className="flex gap-2 items-center">
            <span className={`text-yellow-400 font-bold ${isMobile ? 'text-sm' : 'text-lg'}`}>💰 {Math.floor(playerGold)}</span>
            <span className={`text-blue-400 font-bold ${isMobile ? 'text-sm' : 'text-lg'}`}>⭐ {Math.floor(playerXP)}</span>
          </div>
          {/* Era Progress Indicator */}
          <div className={`flex items-center gap-1 mt-1 ${isMobile ? 'flex-wrap justify-center' : ''}`}>
            <span className={`text-purple-400 font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>{currentAge.name}</span>
            <span className="text-xs text-gray-300">{!isMobile && 'Progress:'}</span>
            <div className={`${isMobile ? 'w-16' : 'w-24'} h-2 bg-gray-700 rounded overflow-hidden`}>
              <div
                className="bg-purple-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (playerXP / currentAge.xpToEvolve) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400 ml-1">{Math.floor(playerXP)} / {currentAge.xpToEvolve}</span>
          </div>
        </div>
        <HealthBar current={aiHealth} max={maxHealth} isPlayer={false} />
      </div>

      {/* Era Character Stats Display (compact) */}
      {!isMobile && (
        <div className="absolute top-11 left-2 bg-gray-800 bg-opacity-90 pointer-events-none rounded px-2 py-1 flex gap-2 items-center">
          <span className="text-xs text-gray-400">Units:</span>
          {currentAge.units.map((unit: UnitStats) => {
            // Calculate upgraded stats
            let displayDamage = unit.damage;
            let displayHealth = unit.health;
            let displayRange = unit.range;

            purchasedUpgrades.forEach((upgradeName: string) => {
              const upgrade = currentAge.upgrades.find((u: Upgrade) => u.name === upgradeName && u.unitName === unit.name);
              if (upgrade) {
                if (upgrade.stat === 'damage') displayDamage += upgrade.value;
                if (upgrade.stat === 'health') displayHealth += upgrade.value;
                if (upgrade.stat === 'range') displayRange += upgrade.value;
              }
            });

            return (
              <div key={unit.name} className="bg-gray-700 rounded px-1.5 py-0.5 flex items-center gap-1">
                <span className="font-bold text-white text-xs truncate max-w-16">{unit.name}</span>
                <div className="flex gap-1 text-[10px]">
                  <span className="text-red-400" title="Attack">⚔️{displayDamage}</span>
                  <span className="text-green-400" title="HP">❤️{displayHealth}</span>
                  <span className="text-blue-400" title="Range">🎯{displayRange}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Build Queue Display */}
      {playerBuildQueue.length > 0 && (
        <div className="absolute bottom-28 left-4 bg-gray-800 bg-opacity-90 rounded p-2 pointer-events-none">
          <div className="text-xs text-gray-400 mb-1">Build Queue:</div>
          {playerBuildQueue.map((item: BuildQueueItem, idx: number) => {
            const timeInSeconds = Math.ceil(item.timeRemaining / 1000);
            const isBuilding = idx === 0;
            return (
              <div key={idx} className={`flex items-center gap-2 ${!isBuilding ? 'opacity-60' : ''}`}>
                <div className="text-sm font-bold text-white">{item.unitStats.name}</div>
                <div className="text-xs text-yellow-400">
                  {isBuilding ? `⏱️ ${timeInSeconds}s` : `⏳ ${idx}`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={`absolute bottom-0 left-0 w-full p-2 bg-gray-800 bg-opacity-70 pointer-events-auto`}>
        {/* Mobile & Tablet: Stack sections vertically */}
        {(isMobile || isTablet) ? (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {/* Unit Spawning Row */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {currentAge.units.map((unit: UnitStats, index: number) => (
                <button
                  key={unit.name}
                  onClick={() => onSpawnUnit(index)}
                  disabled={playerGold < unit.cost}
                  className="flex-shrink-0 p-2 bg-gray-700 rounded-lg border-2 border-gray-500 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex flex-col items-center w-20 min-w-20"
                >
                  <img src={unit.icon} alt={unit.name} className="h-8 w-8 object-contain" />
                  <span className="font-bold text-xs truncate max-w-full">{unit.name}</span>
                  <span className="text-xs text-yellow-400">💰 {unit.cost}</span>
                </button>
              ))}
            </div>

            {/* Upgrades Row */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {currentAge.upgrades.map((upgrade: Upgrade, index: number) => {
                const isPurchased = purchasedUpgrades.includes(upgrade.name);
                return (
                  <button
                    key={upgrade.name}
                    onClick={() => onUpgrade(index)}
                    disabled={playerXP < upgrade.cost || isPurchased}
                    className="flex-shrink-0 p-2 bg-gray-700 rounded-lg border-2 border-gray-500 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex flex-col items-center w-24 min-w-24 text-center"
                    title={upgrade.description}
                  >
                    <span className="font-bold text-xs truncate max-w-full">{upgrade.name}</span>
                    <span className="text-xs mt-1 truncate max-w-full">{isPurchased ? 'PURCHASED' : `⭐ ${upgrade.cost}`}</span>
                  </button>
                );
              })}
            </div>

            {/* Evolve Button Row */}
            <div className="flex justify-center">
              <button
                onClick={onEvolve}
                disabled={!canEvolve}
                className="p-2 bg-purple-700 rounded-lg border-2 border-purple-500 hover:bg-purple-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex flex-col items-center w-20 h-20 justify-center"
              >
                <span className="text-2xl">⭐</span>
                <span className="font-bold text-xs">EVOLVE</span>
              </button>
            </div>
          </div>
        ) : (
          /* Desktop: Single horizontal row with dividers */
          <div className="flex justify-center items-center gap-2">
            {/* Unit Spawning */}
            <div className="flex gap-2">
              {currentAge.units.map((unit: UnitStats, index: number) => (
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
            </div>

            <div className="w-px h-20 bg-gray-500 mx-2"></div>

            {/* Upgrades */}
            <div className="flex gap-2">
              {currentAge.upgrades.map((upgrade: Upgrade, index: number) => {
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
                );
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
        )}
      </div>
    </div>
  );
};

export default GameUI;