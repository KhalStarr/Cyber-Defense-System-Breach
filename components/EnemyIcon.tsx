
import React from 'react';
import { EnemyType } from '../types';
import { ENEMIES } from '../constants';

interface EnemyIconProps {
  type: EnemyType;
  size?: number;
}

const EnemyIcon: React.FC<EnemyIconProps> = ({ type, size = 60 }) => {
  const cfg = ENEMIES[type];
  const half = size / 2;
  const padding = size * 0.2;
  const innerSize = size - padding * 2;

  const renderShape = () => {
    switch (type) {
      case EnemyType.BIT_PACKET:
        return <line x1={padding} y1={padding} x2={size-padding} y2={size-padding} stroke={cfg.color} strokeWidth="3" />;
      case EnemyType.VIRUS:
      case EnemyType.ZERO_DAY:
        const points = [];
        for (let i = 0; i < 6; i++) {
          const ang = (i * Math.PI) / 3;
          points.push(`${half + Math.cos(ang) * (half - padding)},${half + Math.sin(ang) * (half - padding)}`);
        }
        return <polygon points={points.join(' ')} fill="none" stroke={cfg.color} strokeWidth="3" />;
      case EnemyType.WORM:
        return (
          <>
            <line x1={padding} y1={half} x2={size-padding} y2={half} stroke={cfg.color} strokeWidth="3" />
            <line x1={half} y1={padding} x2={half} y2={size-padding} stroke={cfg.color} strokeWidth="3" />
          </>
        );
      case EnemyType.TROJAN:
        return <rect x={padding} y={padding} width={innerSize} height={innerSize} fill="none" stroke={cfg.color} strokeWidth="3" />;
      case EnemyType.SPYWARE:
        return <polygon points={`${half},${padding} ${size-padding},${size-padding} ${padding},${size-padding}`} fill="none" stroke={cfg.color} strokeWidth="3" />;
      case EnemyType.RANSOMWARE:
        return (
          <>
            <rect x={padding} y={padding} width={innerSize} height={innerSize} fill="none" stroke={cfg.color} strokeWidth="3" />
            <line x1={padding} y1={padding} x2={size-padding} y2={size-padding} stroke={cfg.color} strokeWidth="3" />
          </>
        );
      case EnemyType.ROOTKIT:
        const rPoints = [];
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4;
          rPoints.push(`${half + Math.cos(ang) * (half - padding)},${half + Math.sin(ang) * (half - padding)}`);
        }
        return <polygon points={rPoints.join(' ')} fill="none" stroke={cfg.color} strokeWidth="3" />;
      case EnemyType.LOGIC_BOMB:
        return (
          <>
            <circle cx={half} cy={half} r={half-padding-5} fill="none" stroke={cfg.color} strokeWidth="3" />
            {[0, 45, 90, 135].map(deg => (
                <line key={deg} x1={half} y1={padding} x2={half} y2={padding/2} stroke={cfg.color} strokeWidth="2" transform={`rotate(${deg}, ${half}, ${half})`} />
            ))}
          </>
        );
      case EnemyType.BOTNET_NODE:
        return (
          <>
            <rect x={half-innerSize/4} y={half-innerSize/4} width={innerSize/2} height={innerSize/2} fill="none" stroke={cfg.color} strokeWidth="2" />
            <rect x={padding} y={padding} width={innerSize/4} height={innerSize/4} fill="none" stroke={cfg.color} strokeWidth="2" />
            <rect x={size-padding-innerSize/4} y={size-padding-innerSize/4} width={innerSize/4} height={innerSize/4} fill="none" stroke={cfg.color} strokeWidth="2" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {renderShape()}
    </svg>
  );
};

export default EnemyIcon;
