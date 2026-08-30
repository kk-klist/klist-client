export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="kb-logo h-10 w-10 text-lg">K</span>
        <div>
          <h1 className="text-[20px] font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="text-[12px] font-semibold text-success">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}
