import React from 'react';

interface GeneratorSvgPlaceholderProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const GeneratorSvgPlaceholder: React.FC<GeneratorSvgPlaceholderProps> = ({
  className = '',
  width = '100%',
  height = '100%',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 240"
      width={width}
      height={height}
      className={className}
      fill="none"
      aria-label="Изображение генератора TecEner"
    >
      <rect width="320" height="240" rx="12" fill="#F1F5F9" />
      
      {/* Outer steel frame */}
      <path
        d="M 45 45 L 275 45 Q 285 45 285 55 L 285 185 Q 285 195 275 195 L 45 195 Q 35 195 35 185 L 35 55 Q 35 45 45 45 Z"
        stroke="#CBD5E1"
        strokeWidth="6"
        fill="#FFFFFF"
      />

      {/* Generator body block */}
      <rect x="52" y="65" width="216" height="115" rx="8" fill="#1E293B" />
      
      {/* Fuel tank top stripe / brand accent */}
      <rect x="52" y="65" width="216" height="18" rx="4" fill="#E52320" />
      <text
        x="64"
        y="78"
        fontFamily="'Montserrat', sans-serif"
        fontSize="11"
        fontWeight="800"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        TECENER
      </text>
      
      {/* Fuel cap */}
      <rect x="230" y="55" width="24" height="10" rx="3" fill="#64748B" />

      {/* Cooling ventilation slots */}
      <g stroke="#334155" strokeWidth="3" strokeLinecap="round">
        <line x1="68" y1="102" x2="140" y2="102" />
        <line x1="68" y1="114" x2="140" y2="114" />
        <line x1="68" y1="126" x2="140" y2="126" />
        <line x1="68" y1="138" x2="140" y2="138" />
        <line x1="68" y1="150" x2="140" y2="150" />
        <line x1="68" y1="162" x2="140" y2="162" />
      </g>

      {/* Control panel & meter */}
      <rect x="160" y="96" width="94" height="72" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
      
      {/* Voltage display */}
      <rect x="170" y="104" width="40" height="18" rx="2" fill="#020617" />
      <text
        x="190"
        y="117"
        fontFamily="monospace"
        fontSize="10"
        fontWeight="bold"
        fill="#10B981"
        textAnchor="middle"
      >
        230 V
      </text>

      {/* Circuit breaker switches & sockets */}
      <circle cx="230" cy="113" r="5" fill="#E52320" />
      <circle cx="182" cy="144" r="9" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
      <circle cx="218" cy="144" r="9" fill="#1E293B" stroke="#64748B" strokeWidth="2" />

      {/* Heavy-duty rubber mounting feet */}
      <rect x="58" y="195" width="30" height="8" rx="2" fill="#0F172A" />
      <rect x="232" y="195" width="30" height="8" rx="2" fill="#0F172A" />

      {/* Transport handle */}
      <path
        d="M 120 45 L 120 32 Q 120 26 128 26 L 192 26 Q 200 26 200 32 L 200 45"
        stroke="#475569"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="138" y="23" width="44" height="6" rx="3" fill="#E52320" />

      {/* Watermark / Badge */}
      <text
        x="160"
        y="222"
        fontFamily="'Inter', sans-serif"
        fontSize="10"
        fontWeight="600"
        fill="#94A3B8"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        СИЛОВОЕ ОБОРУДОВАНИЕ
      </text>
    </svg>
  );
};
