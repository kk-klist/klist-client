import { useState } from 'react';

// 키워드 검색바 — 빈 입력은 호출하지 않는다 (F-01)
export function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  return (
    <form
      className="flex items-center gap-2.5 rounded-full bg-white px-5 py-3 shadow-float"
      onSubmit={(e) => {
        e.preventDefault();
        const kw = value.trim();
        if (kw) onSearch(kw);
      }}
    >
      <span className="text-muted2" aria-hidden>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        className="flex-1 bg-transparent text-[14px] font-semibold outline-none placeholder:font-normal placeholder:text-muted2"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="장소·키워드 검색"
        inputMode="search"
      />
    </form>
  );
}
