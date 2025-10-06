import React, { useState, useEffect, useRef } from 'react';
import type { Character } from '../characters/Character';
import { Affiliation } from '../types';
import { getFramesForUnit } from '../characters/animationRegistry';
import { GAME_CONFIG } from '../constants';

interface UnitProps {
  unit: Character;
}

const Unit: React.FC<UnitProps> = ({ unit }) => {
  const healthPercentage = (unit.health / unit.maxHealth) * 100;
  const healthBarColor = unit.affiliation === Affiliation.Player ? 'bg-green-500' : 'bg-red-500';

  const [isFlashing, setIsFlashing] = useState(false);
  const prevHealthRef = useRef(unit.health);

  useEffect(() => {
    if (unit.health < prevHealthRef.current) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 200); // Flash for 200ms
      return () => clearTimeout(timer);
    }
    prevHealthRef.current = unit.health;
  }, [unit.health]);
  
  const flashClass = isFlashing ? 'animate-flash' : '';

  // Frame-based animation (for any unit registered in animationRegistry)
  const [frameIndex, setFrameIndex] = useState(0);
  const lastStatusRef = useRef(unit.status);
  const frames = getFramesForUnit(unit.stats.name, unit.status === 'attacking' ? 'attacking' : 'walking');
  const isFrameAnimated = !!frames && frames.length > 0;

  // Advance frame for Clubman
  useEffect(() => {
  if (!isFrameAnimated) return;

    // Reset animation when status changes
    if (lastStatusRef.current !== unit.status) {
      lastStatusRef.current = unit.status;
      setFrameIndex(0);
    }

  if (!frames || frames.length === 0) return;

    const attackSpeedFactor = unit.status === 'attacking' ? 0.07 : 0.12; // seconds per frame
    let animationFrame: number;
    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      if (delta >= attackSpeedFactor) {
        lastTime = now;
        setFrameIndex(prev => (prev + 1) % frames.length);
      }
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [isFrameAnimated, unit.status, frames]);

  const imageUrl = (() => {
    if (isFrameAnimated && frames) return frames[frameIndex] || unit.stats.walkImage;
    return unit.status === 'attacking' ? unit.stats.attackImage : unit.stats.walkImage;
  })();

  const animationClass = isFrameAnimated ? '' : (unit.status === 'attacking' ? 'animate-unit-attack' : 'animate-unit-walk');

  // Calculate z-index based on x position to create depth layering
  // Units further to the right (higher x) appear in front
  const zIndex = Math.floor(unit.x);

  return (
    <div
      className="absolute transition-all duration-100 ease-linear"
      style={{
        left: `${unit.x}px`,
        bottom: `${GAME_CONFIG.PLAYFIELD_GROUND_OFFSET}px`,
        width: `${unit.stats.width}px`,
        height: `${unit.stats.height}px`,
        transform: `translateX(-50%) ${unit.affiliation === Affiliation.AI ? 'scaleX(-1)' : ''}`,
        zIndex: zIndex,
      }}
    >
      <img
        src={imageUrl}
        alt={unit.stats.name}
        className={`w-full h-full object-contain ${animationClass} ${flashClass}`}
        draggable={false}
      />
      {/* Health bar - centered and 60% of character width to prevent overlap */}
      <div
        className="absolute -top-2 h-1 bg-gray-700 rounded"
        style={{
          width: '60%',
          left: '20%',
        }}
      >
        <div
          className={`${healthBarColor} h-full rounded`}
          style={{ width: `${healthPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Unit;
