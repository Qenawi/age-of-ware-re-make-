
import React from 'react';
import type { Affiliation } from '../types';
import { Affiliation as AffiliationEnum } from '../types';


interface GameOverScreenProps {
  winner: Affiliation | null;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ winner, onRestart }) => {
  const message = winner === AffiliationEnum.Player ? "You Win!" : "You Lose!";
  const color = winner === AffiliationEnum.Player ? "text-green-400" : "text-red-500";

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex flex-col justify-center items-center z-50">
      <h1 className={`text-8xl font-bold ${color} mb-8`} style={{ fontFamily: 'Impact, sans-serif' }}>{message}</h1>
      <button
        onClick={onRestart}
        className="px-8 py-4 bg-blue-600 text-white font-bold text-2xl rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
      >
        Play Again
      </button>
    </div>
  );
};

export default GameOverScreen;
