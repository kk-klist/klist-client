export function ProgressDonut({ percent }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84">
      <circle cx="42" cy="42" r={r} fill="none" stroke="#f0eef3" strokeWidth="9" />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke="#7131F5"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${(c * percent) / 100} ${c}`}
        transform="rotate(-90 42 42)"
      />
      <text x="42" y="47" textAnchor="middle" fontSize="17" fontWeight="800" fill="#16131a">
        {percent}
        <tspan fontSize="10" fill="#8a8792">
          %
        </tspan>
      </text>
    </svg>
  );
}
