import { cn } from '@/shared/utils/cn';
import { CATEGORIES, GENRES } from './mapConstants';

export function CategoryTabs({ active, onChange }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          type="button"
          className={cn('kb-chip', c.key === active && 'kb-chip--active')}
          onClick={() => onChange(c)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

// Pick 탭 장르 필터 칩 (장르색 활성)
export function GenreChips({ genre, onGenre }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {[null, ...GENRES].map((g) => (
        <button
          key={g ?? 'all'}
          type="button"
          className={cn('kb-chip', genre === g && 'border-primary bg-primary text-white')}
          onClick={() => onGenre(g)}
        >
          {g ?? 'All'}
        </button>
      ))}
    </div>
  );
}
