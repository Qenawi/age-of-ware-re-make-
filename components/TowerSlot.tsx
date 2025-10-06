import React, { useState } from 'react';
import type { TowerSlot, TowerStats } from '../types';

interface TowerSlotProps {
  slot: TowerSlot;
  isPlayer: boolean;
  availableTowers: TowerStats[];
  playerGold: number;
  onBuild: (slotId: number, towerIndex: number) => void;
  onUpgrade: (slotId: number, towerIndex: number) => void;
  onSell: (slotId: number) => void;
}

const TowerSlotComponent: React.FC<TowerSlotProps> = ({
  slot,
  isPlayer,
  availableTowers,
  playerGold,
  onBuild,
  onUpgrade,
  onSell
}) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div
      className="absolute"
      style={{
        left: `${slot.x}px`,
        top: `${slot.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Empty slot - Build Menu */}
      {!slot.tower && isPlayer && (
        <div className="relative">
          <div
            className="w-16 h-16 border-2 border-dashed border-gray-400 rounded-lg bg-gray-800 bg-opacity-50 flex items-center justify-center hover:border-yellow-400 hover:bg-opacity-70 transition-all cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="text-2xl text-gray-500">+</div>
          </div>

          {/* Build Tower Menu */}
          {showMenu && (
            <div className="absolute top-0 left-full ml-2 bg-gray-800 border-2 border-gray-600 rounded p-2 z-50 min-w-48">
              <div className="text-xs text-gray-400 mb-1">Build Tower:</div>
              {availableTowers.map((tower, idx) => (
                <button
                  key={tower.name}
                  onClick={() => {
                    onBuild(slot.id, idx);
                    setShowMenu(false);
                  }}
                  disabled={playerGold < tower.cost}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded mb-1"
                >
                  <div className="font-bold text-white">{tower.name}</div>
                  <div className="text-yellow-400">💰 {tower.cost}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty slot - AI side (no interaction) */}
      {!slot.tower && !isPlayer && (
        <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800 bg-opacity-30 flex items-center justify-center">
          <div className="text-2xl text-gray-600">+</div>
        </div>
      )}

      {/* Tower Built - Player Side */}
      {slot.tower && isPlayer && (
        <div className="relative">
          <div
            className="w-20 h-20 border-2 border-green-500 rounded-lg bg-gray-700 bg-opacity-90 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors p-1"
            onClick={() => setShowMenu(!showMenu)}
          >
            {/* Tower placeholder icon */}
            <div className="text-4xl">🏰</div>
            <div className="text-center w-full mt-1">
              <div className="text-xs font-bold text-white truncate px-1">{slot.tower.name}</div>
              <div className="text-xs text-green-400">⚔️{slot.tower.damage}</div>
            </div>
          </div>

          {/* Tower Controls Menu */}
          {showMenu && (
            <div className="absolute top-0 left-full ml-2 bg-gray-800 border-2 border-gray-600 rounded p-2 z-50 min-w-48">
              {/* Upgrade Options */}
              {availableTowers
                .filter(t => t.upgradeFrom === slot.tower!.name)
                .map((upgradeTower, idx) => {
                  const upgradeCost = upgradeTower.cost - slot.tower!.cost;
                  return (
                    <button
                      key={upgradeTower.name}
                      onClick={() => {
                        const towerIdx = availableTowers.findIndex(t => t.name === upgradeTower.name);
                        onUpgrade(slot.id, towerIdx);
                        setShowMenu(false);
                      }}
                      disabled={playerGold < upgradeCost}
                      className="w-full text-left px-2 py-1 text-xs hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded mb-1"
                    >
                      <div className="font-bold text-blue-400">↑ {upgradeTower.name}</div>
                      <div className="text-yellow-400">💰 {upgradeCost}</div>
                    </button>
                  );
                })}

              {/* Sell Button */}
              <button
                onClick={() => {
                  onSell(slot.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-2 py-1 text-xs hover:bg-gray-700 rounded text-orange-400"
              >
                Sell (+💰{slot.tower.sellValue})
              </button>
            </div>
          )}

          {/* Range Indicator */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full border border-blue-400 opacity-20 pointer-events-none"
            style={{
              width: `${slot.tower.range * 2}px`,
              height: `${slot.tower.range * 2}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      )}

      {/* Tower Built - AI Side (no interaction) */}
      {slot.tower && !isPlayer && (
        <div className="w-20 h-20 border-2 border-red-500 rounded-lg bg-gray-700 bg-opacity-90 flex flex-col items-center justify-center p-1">
          {/* Tower placeholder icon */}
          <div className="text-4xl">🏰</div>
          <div className="text-center w-full mt-1">
            <div className="text-xs font-bold text-white truncate px-1">{slot.tower.name}</div>
            <div className="text-xs text-red-400">⚔️{slot.tower.damage}</div>
          </div>
        </div>
      )}

      {/* Slot label */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
        Slot {slot.id + 1}
      </div>
    </div>
  );
};

export default TowerSlotComponent;