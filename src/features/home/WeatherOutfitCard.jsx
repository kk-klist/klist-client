import { useWeatherOutfitQuery } from './weatherApi';
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

const CONDITION_LABEL = {
  SUNNY: '맑음',
  RAINY: '비',
  SLEET: '진눈깨비',
  SNOWY: '눈',
  SHOWER: '소나기',
  WINDY: '강풍',
};

const FALLBACK_ICON = '🌤️';

export function WeatherOutfitCard() {
  const { data, isLoading, isError } = useWeatherOutfitQuery();

  if (isLoading) return <Spinner />;
  // 백엔드 에러 코드/메시지(예: 위도·경도 검증 실패)는 사용자가 유발한 게 아니라서 그대로 노출하지 않는다.
  if (isError) return <ErrorMessage message="날씨 정보를 불러올 수 없어요." />;
  if (!data) return <EmptyState message="날씨 정보가 없어요." />;

  const { weather, outfit } = data;
  const icon = CONDITION_ICON[weather.condition] ?? FALLBACK_ICON;
  const label = CONDITION_LABEL[weather.condition] ?? weather.condition;
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
              {observedTime && ` · ${observedTime} 기준`}
            </span>
          </p>
          <p className="text-[13px] text-muted-foreground">
            오늘의 추천 복장 · {outfit.temperatureRange}°C
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
