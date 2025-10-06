
import React, { useState } from 'react';
import { Difficulty } from '../GameManager';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Hard);

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex flex-col justify-center items-center z-50">
      <h1 className="text-7xl font-bold text-white mb-4" style={{ fontFamily: 'Impact, sans-serif' }}>AGE OF WAR</h1>
      <p className="text-xl text-gray-300 mb-8">Destroy the enemy base to win!</p>

      {/* Difficulty Selector */}
      <div className="mb-8">
        <p className="text-lg text-gray-400 mb-3 text-center">Select Difficulty:</p>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedDifficulty(Difficulty.Medium)}
            className={`px-6 py-3 font-bold text-lg rounded-lg transition-all ${
              selectedDifficulty === Difficulty.Medium
                ? 'bg-yellow-600 text-white scale-105 shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setSelectedDifficulty(Difficulty.Hard)}
            className={`px-6 py-3 font-bold text-lg rounded-lg transition-all ${
              selectedDifficulty === Difficulty.Hard
                ? 'bg-red-600 text-white scale-105 shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Hard
          </button>
        </div>
      </div>

      <button
        onClick={() => onStart(selectedDifficulty)}
        className="px-8 py-4 bg-green-600 text-white font-bold text-2xl rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
      >
        Start Game
      </button>

      {/* Difficulty Info */}
      <div className="mt-6 max-w-lg text-center">
        {selectedDifficulty === Difficulty.Medium && (
          <p className="text-sm text-yellow-400">
            Medium: AI spawns units at normal rate and builds basic defenses
          </p>
        )}
        {selectedDifficulty === Difficulty.Hard && (
          <div className="text-sm text-red-400">
            <p className="font-bold mb-1">Hard Mode:</p>
            <ul className="text-xs space-y-1">
              <li>• AI starts with 700 gold (vs 250)</li>
              <li>• AI earns 3x gold income and 2x XP income</li>
              <li>• AI spawns units 30% faster</li>
              <li>• AI uses smart unit composition and manages towers</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartScreen;
