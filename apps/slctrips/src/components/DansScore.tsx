'use client';

interface DansScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function DansScore({ score, size = 'md', showLabel = false }: DansScoreProps) {
  const getColor = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-20 h-20 text-xl',
    lg: 'w-24 h-24 text-2xl'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getColor(score)} flex items-center justify-center text-white font-bold shadow-lg`}>
        {Math.round(score)}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-400">Dan's Score</span>
      )}
    </div>
  );
}
