import React from 'react';

/**
 * Renders an SVG-based character sprite for each statistical archetype.
 * IDs: Mean, Trend, StandardDeviation, Outlier, CI
 * Poses: idle, talking, pointer, surprised, shroud
 */
function CharacterSprite({ id, size = 100, pose = 'idle' }) {
  const getCharacterSVG = () => {
    // Shared xkcd stick figure components
    const head = <circle cx="50" cy="25" r="8" fill="none" stroke="var(--ink)" strokeWidth="2" />;
    const body = <line x1="50" y1="33" x2="50" y2="60" stroke="var(--ink)" strokeWidth="2" />;
    const legs = (
      <g>
        <line x1="50" y1="60" x2="40" y2="85" stroke="var(--ink)" strokeWidth="2" />
        <line x1="50" y1="60" x2="60" y2="85" stroke="var(--ink)" strokeWidth="2" />
      </g>
    );

    const getArms = (leftPose, rightPose) => {
      // Poses: 'down', 'up', 'pointer', 'spread'
      let lArm, rArm;
      if (leftPose === 'pointer') lArm = <line x1="50" y1="40" x2="20" y2="30" stroke="var(--ink)" strokeWidth="2" />;
      else if (leftPose === 'up') lArm = <line x1="50" y1="40" x2="35" y2="20" stroke="var(--ink)" strokeWidth="2" />;
      else lArm = <line x1="50" y1="40" x2="35" y2="65" stroke="var(--ink)" strokeWidth="2" />;

      if (rightPose === 'pointer') rArm = <line x1="50" y1="40" x2="80" y2="30" stroke="var(--ink)" strokeWidth="2" />;
      else if (rightPose === 'up') rArm = <line x1="50" y1="40" x2="65" y2="20" stroke="var(--ink)" strokeWidth="2" />;
      else rArm = <line x1="50" y1="40" x2="65" y2="65" stroke="var(--ink)" strokeWidth="2" />;
      
      return <g>{lArm}{rArm}</g>;
    };

    switch (id) {
      case 'Mean':
        return (
          <g className={`char-mean pose-${pose}`}>
            {/* Average/Mean - Simple stick figure with a blue shirt marker */}
            <rect x="42" y="35" width="16" height="20" fill="var(--mean-blue)" opacity="0.3" />
            {head}{body}{legs}
            {getArms(pose === 'talking' ? 'up' : 'down', 'down')}
          </g>
        );
      case 'Trend':
        return (
          <g className={`char-trend pose-${pose}`}>
            {/* Storyline/Trend - Pointing stick figure with purple shirt marker */}
            <rect x="42" y="35" width="16" height="20" fill="var(--trend-purple)" opacity="0.3" />
            {head}{body}{legs}
            {getArms('down', pose === 'pointer' ? 'pointer' : 'down')}
          </g>
        );
      case 'StandardDeviation':
        return (
          <g className={`char-sd pose-${pose}`}>
            {/* Spread/SD - Stick figure with wide arms and orange shirt marker */}
            <rect x="42" y="35" width="16" height="20" fill="var(--sd-orange)" opacity="0.3" />
            {head}{body}{legs}
            {getArms('up', 'up')}
          </g>
        );
      case 'Outlier':
        return (
          <g className={`char-outlier pose-${pose}`}>
            {/* Rebel/Outlier - Stick figure standing in a surprised/rebel pose with red marker */}
            <rect x="42" y="35" width="16" height="20" fill="var(--outlier-red)" opacity="0.3" />
            {head}{body}{legs}
            {getArms(pose === 'talking' ? 'pointer' : 'up', 'up')}
            {/* A small rebel accessory - a slightly tilted beret or hat line */}
            <line x1="42" y1="18" x2="58" y2="15" stroke="var(--outlier-red)" strokeWidth="2" />
          </g>
        );
      case 'CI':
        return (
          <g className={`char-ci pose-${pose}`}>
            {/* CI - Stick figure partially obscured by a fuzzy circle */}
            <circle cx="50" cy="50" r="40" fill="var(--ci-green)" opacity="0.1" stroke="var(--ci-green)" strokeWidth="1" strokeDasharray="2 2" />
            {head}{body}{legs}
            {getArms('down', 'down')}
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`character-sprite char-${id}`} style={{ width: size, height: size }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ filter: 'var(--wobble-filter)' }}>
        {getCharacterSVG()}
      </svg>
      <style jsx>{`
        .character-sprite { display: flex; align-items: flex-end; justify-content: center; }
        .pose-talking { transform-origin: bottom; animation: bounce 0.3s infinite alternate; }
        @keyframes bounce { from { transform: scaleY(1); } to { transform: scaleY(1.05); } }
      `}</style>
    </div>
  );
}

export default CharacterSprite;
