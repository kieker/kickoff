export type WeatherLocation = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type WeatherForecast = {
  location: WeatherLocation;
  current: {
    temperature: number;
    apparentTemperature: number;
    weatherCode: number;
    windSpeed: number;
    precipitation: number;
    time: string;
  };
  daily: Array<{
    date: string;
    weatherCode: number;
    temperatureMax: number;
    temperatureMin: number;
    precipitationProbabilityMax: number;
    sunrise: string;
    sunset: string;
  }>;
};

type GeocodingResponse = {
  results?: Array<{
    id: number;
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }>;
};

type ForecastResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

export const defaultWeatherLocation: WeatherLocation = {
  id: 3369157,
  name: "Cape Town",
  country: "South Africa",
  admin1: "Western Cape",
  latitude: -33.9258,
  longitude: 18.4232,
  timezone: "Africa/Johannesburg"
};

export async function searchWeatherLocations(query: string): Promise<WeatherLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Location search failed");
  }

  const data = (await response.json()) as GeocodingResponse;
  return (
    data.results?.map((result) => ({
      id: result.id,
      name: result.name,
      country: result.country,
      admin1: result.admin1,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone
    })) ?? []
  );
}

export async function fetchWeatherForecast(
  location: WeatherLocation
): Promise<WeatherForecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset"
  );
  url.searchParams.set("forecast_days", "4");
  url.searchParams.set("timezone", location.timezone || "auto");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Forecast request failed");
  }

  const data = (await response.json()) as ForecastResponse;
  return {
    location,
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      precipitation: data.current.precipitation,
      time: data.current.time
    },
    daily: data.daily.time.map((date, index) => ({
      date,
      weatherCode: data.daily.weather_code[index],
      temperatureMax: data.daily.temperature_2m_max[index],
      temperatureMin: data.daily.temperature_2m_min[index],
      precipitationProbabilityMax: data.daily.precipitation_probability_max[index],
      sunrise: data.daily.sunrise[index],
      sunset: data.daily.sunset[index]
    }))
  };
}

export function describeWeatherCode(code: number) {
  if (code === 0) return "clear sky";
  if ([1, 2, 3].includes(code)) return "partly cloudy";
  if ([45, 48].includes(code)) return "foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "thunderstorms";
  return "mixed conditions";
}
