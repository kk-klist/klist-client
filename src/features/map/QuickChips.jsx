import { QUICK_PLACES } from './geo';

// 퀵 액세스 칩 (F-02)
export function QuickChips({ onPick }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {Object.keys(QUICK_PLACES).map((name) => (
        <button key={name} type="button" className="kb-chip" onClick={() => onPick(name)}>
          {name}
        </button>
      ))}
    </div>
  );
}
