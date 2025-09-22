
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex flex-col justify-center items-center z-50">
      <h1 className="text-7xl font-bold text-white mb-4" style={{ fontFamily: 'Impact, sans-serif' }}>AGE OF WAR</h1>
      <p className="text-xl text-gray-300 mb-8">Destroy the enemy base to win!</p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-green-600 text-white font-bold text-2xl rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
      >
        Start Game
      </button>
    </div>
  );
};

export default StartScreen;
