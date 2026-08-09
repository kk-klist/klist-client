import { useQuery } from '@tanstack/react-query';
import { weatherClient } from '@/shared/api/weatherClient';
import { getCurrentPosition } from '@/shared/utils/geo';

const unwrap = (res) => res?.data;

const fetchWeatherOutfit = (lat, lng) =>
  weatherClient.get('/weather/outfit', { params: { lat, lng } }).then(unwrap);

async function fetchCurrentWeatherOutfit() {
  const { lat, lng } = await getCurrentPosition();
  return fetchWeatherOutfit(lat, lng);
}

export function useWeatherOutfitQuery() {
  return useQuery({ queryKey: ['weather', 'outfit'], queryFn: fetchCurrentWeatherOutfit });
}
