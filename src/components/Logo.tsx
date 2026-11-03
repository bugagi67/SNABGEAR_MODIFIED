// Logo.tsx — Компонент логотипа с поддержкой светлой и тёмной темы
import React from 'react';

interface LogoProps {
  variant?: 1 | 2;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 1, 
  theme = 'auto', 
  className = '', 
  width = 230, 
  height = 50 
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const gearColor = isDark ? '#EF4444' : '#E52320';
  const subColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <a href="/" className={`inline-block ${className}`} aria-label="СНАБГИР (SNABGEAR) — Главная страница">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 460 95" 
        width={width} 
        height={height}
        role="img"
        aria-label="Логотип компании СНАБГИР (SNABGEAR) — Комплексное снабжение предприятий"
      >
        <title>СНАБГИР (SNABGEAR) — Комплексное снабжение предприятий</title>
        {/* Значок и типографика переключаются автоматически по переменным */}
        {variant === 1 ? (
          <g transform="translate(10, 5)">
            <path d="M 42.5 5 L 47.5 5 L 48.5 13.5 L 53.5 15.5 L 60 9.5 L 63.5 13 L 59.5 20 L 63 24 L 71 21.5 L 73 26.5 L 66 31 L 67.5 36 L 76 37 L 76 43 L 67.5 44 L 66 49 L 73 53.5 L 71 58.5 L 63 56 L 59.5 60 L 63.5 67 L 60 70.5 L 53.5 64.5 L 48.5 66.5 L 47.5 75 L 42.5 75 L 41.5 66.5 L 36.5 64.5 L 30 70.5 L 26.5 67 L 30.5 60 L 27 56 L 19 58.5 L 17 53.5 L 24 49 L 22.5 44 L 14 43 L 14 37 L 22.5 36 L 24 31 L 17 26.5 L 19 21.5 L 27 24 L 30.5 20 L 26.5 13 L 30 9.5 L 36.5 15.5 L 41.5 13.5 Z" fill={gearColor}/>
            <circle cx="45" cy="40" r="24" fill={isDark ? '#0F172A' : '#FFFFFF'}/>
            <circle cx="45" cy="40" r="21" fill="none" stroke={gearColor} strokeWidth="3"/>
            <text x="45" y="47" fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="22" fill={isDark ? '#FFFFFF' : '#0F172A'} textAnchor="middle">SG</text>
          </g>
        ) : (
          <g transform="translate(10, 5)">
            <path d="M 45 4 L 72 20 L 72 30 L 78 33 L 78 47 L 72 50 L 72 60 L 45 76 L 18 60 L 18 50 L 12 47 L 12 33 L 18 30 L 18 20 Z" fill={gearColor}/>
            <text x="45" y="47" fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" textAnchor="middle">SG</text>
          </g>
        )}
        <text x="105" y="52" fontFamily="'Montserrat', sans-serif" fontWeight="900" fontSize="46" letterSpacing="1">
          <tspan fill={textColor}>SNAB</tspan>
          <tspan fill={gearColor}>GEAR</tspan>
        </text>
        <text x="108" y="78" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3.5" fill={subColor}>
          B2B ПОСТАВКИ · СМОЛЕНСК
        </text>
      </svg>
    </a>
  );
};
