import { useWeatherOutfitQuery } from './weatherApi';
import { useHomeCopy } from './homeLocale';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { EmptyState } from '@/shared/components/EmptyState';

const CONDITION_ICON = {
  SUNNY: '☀️',
  RAINY: '🌧️',
  SLEET: '🌨️',
  SNOWY: '❄️',
  SHOWER: '🌦️',
  WINDY: '💨',
};

const FALLBACK_ICON = '🌤️';

export function WeatherOutfitCard() {
  const { data, isLoading, isError } = useWeatherOutfitQuery();
  const copy = useHomeCopy();

  if (isLoading) return <Spinner />;
  // 백엔드 에러 코드/메시지(예: 위도·경도 검증 실패)는 사용자가 유발한 게 아니라서 그대로 노출하지 않는다.
  if (isError) return <ErrorMessage message={copy.weatherError} />;
  if (!data) return <EmptyState message={copy.weatherEmpty} />;

  const { weather, outfit } = data;
  const icon = CONDITION_ICON[weather.condition] ?? FALLBACK_ICON;
  const label = copy.conditionLabels[weather.condition] ?? weather.condition;
  const observedTime = weather.observedAt?.slice(11, 16);

  return (
    <section className="kb-card flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-weather-gradient text-xl">
          {icon}
        </span>
        <div>
          <p className="text-[15px] font-extrabold">
            {Math.round(weather.temperature)}°{' '}
            <span className="font-semibold text-muted-foreground">
              {label}
              {observedTime && ` · ${observedTime} ${copy.observedAtSuffix}`}
            </span>
          </p>
          <p className="text-[13px] text-muted-foreground">
            {copy.todayOutfit} · {outfit.temperatureRange}°C
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {outfit.items.map((item) => (
          <span key={item} className="kb-chip">
            {item}
          </span>
        ))}
      </div>

      {outfit.additionalTips.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {outfit.additionalTips.map((tip) => (
            <li key={tip} className="flex gap-1.5 text-[12px] text-muted-foreground">
              <span className="text-primary">•</span>
              {tip}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
