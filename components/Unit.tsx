import React, { useState, useEffect, useRef } from 'react';
import type { Character } from '../characters/Character';
import { Affiliation } from '../types';

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
  
  const imageUrl = unit.status === 'attacking' ? unit.stats.attackImage : unit.stats.walkImage;
  const flashClass = isFlashing ? 'animate-flash' : '';
  const animationClass = unit.status === 'attacking' ? 'animate-unit-attack' : 'animate-unit-walk';

  return (
    <div
      className="absolute bottom-[80px] transition-all duration-100 ease-linear"
      style={{
        left: `${unit.x}px`,
        width: `${unit.stats.width}px`,
        height: `${unit.stats.height}px`,
        transform: `translateX(-50%) ${unit.affiliation === Affiliation.AI ? 'scaleX(-1)' : ''}`,
      }}
    >
      <img
        src={imageUrl}
        alt={unit.stats.name}
        className={`w-full h-full object-contain ${animationClass} ${flashClass}`}
      />
      <div className="absolute -top-2 w-full h-1.5 bg-gray-600 rounded">
        <div
          className={`${healthBarColor} h-full rounded`}
          style={{ width: `${healthPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Unit;
