import { useMemo } from 'react';

interface PrideData {
  productive: { nilai: number };
  rabbani: { nilai: number };
  intelligent: { nilai: number };
  discipline: { nilai: number };
  ethic: { nilai: number };
}

interface Props {
  data: PrideData;
  size?: number;
  showLabels?: boolean;
}

export default function PrideRadarChart({ data, size = 280, showLabels = true }: Props) {
  const center = size / 2;
  const radius = (size / 2) - 40;

  const labels = [
    { key: 'productive', label: 'P', fullLabel: 'Productive', color: '#f97316' },
    { key: 'rabbani', label: 'R', fullLabel: 'Rabbani', color: '#22c55e' },
    { key: 'intelligent', label: 'I', fullLabel: 'Intelligent', color: '#8b5cf6' },
    { key: 'discipline', label: 'D', fullLabel: 'Discipline', color: '#ef4444' },
    { key: 'ethic', label: 'E', fullLabel: 'Ethic', color: '#ec4899' },
  ];

  const points = useMemo(() => {
    return labels.map((item, i) => {
      const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      const value = (data[item.key as keyof PrideData]?.nilai ?? 0) / 100;
      const x = center + radius * value * Math.cos(angle);
      const y = center + radius * value * Math.sin(angle);
      return { x, y, angle, value, ...item };
    });
  }, [data, center, radius]);

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={labels.map((_, i) => {
              const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
              const x = center + radius * level * Math.cos(angle);
              const y = center + radius * level * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {labels.map((_, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={polygonPath}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="2.5"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="6"
            fill={p.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {showLabels && labels.map((item, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const labelRadius = radius + 25;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          const value = data[item.key as keyof PrideData]?.nilai ?? 0;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="16" fill={item.color} />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {item.label}
              </text>
              <text
                x={x}
                y={y + 30}
                textAnchor="middle"
                fill="#374151"
                fontSize="11"
                fontWeight="600"
              >
                {value.toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {labels.map((item) => (
          <div key={item.key} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 font-medium">{item.fullLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
