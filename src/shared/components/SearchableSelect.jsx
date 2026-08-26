import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';

export function SearchableSelect({ options, value, onChange, placeholder, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(option) {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm transition-colors',
          error ? 'border-destructive' : 'border-border',
          !selected && 'text-muted-foreground',
        )}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <span className="text-muted-foreground">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-muted-foreground">결과 없음</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-muted',
                    option.value === value && 'bg-muted font-medium',
                  )}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
