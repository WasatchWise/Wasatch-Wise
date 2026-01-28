'use client';

interface InfoBlurbProps {
  icon?: string;
  title: string;
  content: string;
  category?: 'science' | 'history' | 'celebrity' | 'trivia' | 'local' | 'tip';
}

const categoryStyles = {
  science: 'from-blue-50 to-cyan-50 border-blue-200',
  history: 'from-amber-50 to-orange-50 border-amber-200',
  celebrity: 'from-purple-50 to-pink-50 border-purple-200',
  trivia: 'from-green-50 to-emerald-50 border-green-200',
  local: 'from-red-50 to-rose-50 border-red-200',
  tip: 'from-yellow-50 to-amber-50 border-yellow-200',
};

const categoryIcons = {
  science: '🔬',
  history: '📜',
  celebrity: '⭐',
  trivia: '💡',
  local: '📍',
  tip: '💪',
};

export default function InfoBlurb({
  icon,
  title,
  content,
  category = 'trivia'
}: InfoBlurbProps) {
  const displayIcon = icon || categoryIcons[category];
  const gradientClass = categoryStyles[category];

  return (
    <div className={`bg-gradient-to-br ${gradientClass} rounded-xl p-4 border shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{displayIcon}</span>
        <div className="min-w-0">
          <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">
            {title}
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}

// Compact version for inline use
export function InfoBlurbCompact({
  icon,
  content,
  category = 'trivia'
}: Omit<InfoBlurbProps, 'title'>) {
  const displayIcon = icon || categoryIcons[category];

  return (
    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-lg flex-shrink-0">{displayIcon}</span>
      <p className="text-gray-700 text-sm leading-snug">{content}</p>
    </div>
  );
}

// Full-width banner version
export function InfoBlurbBanner({
  icon,
  title,
  content,
  category = 'trivia'
}: InfoBlurbProps) {
  const displayIcon = icon || categoryIcons[category];
  const gradientClass = categoryStyles[category];

  return (
    <div className={`bg-gradient-to-r ${gradientClass} rounded-xl p-5 border shadow-sm`}>
      <div className="flex items-center gap-4">
        <span className="text-3xl">{displayIcon}</span>
        <div>
          <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
          <p className="text-gray-700 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
