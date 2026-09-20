import { useQuery } from '@tanstack/react-query';
import { weatherClient } from '@/shared/api/weatherClient';
import { getCurrentPosition } from '@/shared/utils/geo';
import { useApiLang } from './homeApi';

const unwrap = (res) => res?.data;

const fetchWeatherOutfit = (latitude, longitude, lang) =>
  weatherClient.get('/weather/outfit', { params: { latitude, longitude, lang } }).then(unwrap);

async function fetchCurrentWeatherOutfit(lang) {
  const { lat, lng } = await getCurrentPosition();
  return fetchWeatherOutfit(lat, lng, lang);
}

export function useWeatherOutfitQuery() {
  const lang = useApiLang();

  return useQuery({
    queryKey: ['weather', 'outfit', lang],
    queryFn: () => fetchCurrentWeatherOutfit(lang),
  });
}
