import React from 'react';

interface BaseProps {
  image: string;
  health: number;
  maxHealth: number;
  isPlayer: boolean;
  x: number;
  groundOffset: number;
}

const Base: React.FC<BaseProps> = ({ image, health, maxHealth, isPlayer, x, groundOffset }) => {
  const healthPercentage = (health / maxHealth) * 100;

  // Determine damage state
  const getDamageEffect = () => {
    if (healthPercentage > 66) return ''; // No damage
    if (healthPercentage > 33) return 'opacity-90 brightness-95'; // Light damage
    if (healthPercentage > 10) return 'opacity-80 brightness-90 saturate-75'; // Heavy damage
    return 'opacity-70 brightness-75 saturate-50 contrast-125'; // Critical damage
  };

  // Shake effect when taking damage
  const [isShaking, setIsShaking] = React.useState(false);
  const prevHealthRef = React.useRef(health);

  React.useEffect(() => {
    if (health < prevHealthRef.current) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 200);
      return () => clearTimeout(timer);
    }
    prevHealthRef.current = health;
  }, [health]);

  // Smoke/fire overlays based on damage
  const showSmoke = healthPercentage < 66;
  const showFire = healthPercentage < 33;
  const showCritical = healthPercentage < 10;

  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        bottom: `${groundOffset}px`,
        animation: isShaking ? 'shake 0.2s ease-in-out' : 'none',
      }}
    >
      {/* Base Image with Damage Filter */}
      <img
        src={image}
        alt={isPlayer ? 'Player Base' : 'AI Base'}
        className={`h-48 ${isPlayer ? '' : 'scale-x-[-1]'} ${getDamageEffect()} transition-all duration-300`}
      />

      {/* Smoke Effect - Light/Medium Damage */}
      {showSmoke && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-500 opacity-40 rounded-full blur-md animate-pulse"></div>
        </div>
      )}

      {/* Fire Effect - Heavy Damage */}
      {showFire && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-4 left-1/4 w-6 h-6 bg-orange-500 opacity-60 rounded-full blur-sm animate-ping"></div>
          <div className="absolute bottom-6 right-1/4 w-5 h-5 bg-red-500 opacity-50 rounded-full blur-sm animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>
      )}

      {/* Critical Damage - Red Flash */}
      {showCritical && (
        <div className="absolute inset-0 bg-red-600 opacity-20 animate-pulse pointer-events-none rounded"></div>
      )}

      {/* Cracks Overlay */}
      {healthPercentage < 50 && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-40" viewBox="0 0 100 100">
            <line x1="30" y1="0" x2="35" y2="100" stroke="black" strokeWidth="1" />
            <line x1="60" y1="20" x2="58" y2="100" stroke="black" strokeWidth="0.8" />
            <line x1="45" y1="10" x2="50" y2="60" stroke="black" strokeWidth="0.6" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Base;