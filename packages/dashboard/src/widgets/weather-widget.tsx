import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CloudSun, Droplets, Loader2, MapPin, Search, Sunrise, Sunset, Wind } from "lucide-react";
import {
  describeWeatherCode,
  fetchWeatherForecast,
  searchWeatherLocations,
  type WeatherLocation
} from "@kickoff/integrations";
import { Button } from "@kickoff/ui";
import { WidgetShell } from "../components/widget-shell";

type WeatherWidgetProps = {
  location: WeatherLocation;
  showIcon: boolean;
  onLocationChange(location: WeatherLocation): void;
  onRefresh?: () => void;
  onHide?: () => void;
};

export function WeatherWidget({
  location,
  showIcon,
  onLocationChange,
  onRefresh,
  onHide
}: WeatherWidgetProps) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const forecastQuery = useQuery({
    queryKey: ["weather", location.id, location.latitude, location.longitude],
    queryFn: () => fetchWeatherForecast(location),
    staleTime: 1000 * 60 * 15
  });

  const searchQuery = useQuery({
    queryKey: ["weather-location-search", query],
    queryFn: () => searchWeatherLocations(query),
    enabled: searchOpen && query.trim().length >= 2,
    staleTime: 1000 * 60 * 30
  });

  const forecast = forecastQuery.data;
  const current = forecast?.current;
  const condition = current ? describeWeatherCode(current.weatherCode) : "weather unavailable";
  const locationLabel = [location.name, location.admin1].filter(Boolean).join(", ");
  const today = forecast?.daily[0];
  const days = useMemo(() => forecast?.daily.slice(1) ?? [], [forecast?.daily]);

  function refreshWeather() {
    forecastQuery.refetch();
    onRefresh?.();
  }

  return (
    <WidgetShell
      title="Weather"
      eyebrow={locationLabel}
      icon={showIcon ? <CloudSun className="h-5 w-5" /> : undefined}
      onRefresh={refreshWeather}
      onHide={onHide}
      action={
        <Button
          aria-label="Change weather location"
          size="icon"
          variant={searchOpen ? "primary" : "ghost"}
          onClick={() => setSearchOpen((open) => !open)}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      }
    >
      {searchOpen ? (
        <div className="mb-4 rounded-md border border-black/10 bg-white/50 p-3 dark:border-white/10 dark:bg-white/8">
          <label className="mb-2 flex items-center gap-2 rounded-md border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/18">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder="Search city"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </label>

          <div className="space-y-1">
            {searchQuery.isFetching ? (
              <p className="px-1 py-2 text-xs text-muted-foreground">Searching...</p>
            ) : null}
            {searchQuery.data?.map((result) => (
              <button
                key={result.id}
                type="button"
                aria-label={`Select weather location ${formatLocation(result)}`}
                className="block w-full rounded px-2 py-2 text-left text-xs transition hover:bg-black/8 dark:hover:bg-white/10"
                onClick={() => {
                  onLocationChange(result);
                  setQuery("");
                  setSearchOpen(false);
                }}
              >
                <span className="block font-medium">{result.name}</span>
                <span className="text-muted-foreground">
                  {formatLocationDetail(result)}
                </span>
              </button>
            ))}
            {searchQuery.isError ? (
              <p className="px-1 py-2 text-xs text-red-500">
                Location search is unavailable right now.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {forecastQuery.isLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded-md bg-white/50 text-sm text-muted-foreground dark:bg-white/8">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading forecast
        </div>
      ) : null}

      {forecastQuery.isError ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">
          <p className="font-semibold text-red-500">Weather is unavailable</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The dashboard will keep your saved location and try again on refresh.
          </p>
          <Button className="mt-3" size="sm" variant="secondary" onClick={refreshWeather}>
            Try again
          </Button>
        </div>
      ) : null}

      {current ? (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-5xl font-semibold tracking-normal">
                {Math.round(current.temperature)}
              </p>
              <p className="text-sm text-muted-foreground">
                {condition}, feels like {Math.round(current.apparentTemperature)}
              </p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-yellow-300/18 text-yellow-100">
              <CloudSun className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-md bg-white/50 p-3 dark:bg-white/8">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Wind className="h-3.5 w-3.5" />
                wind
              </div>
              <p className="font-semibold">{Math.round(current.windSpeed)} km/h</p>
            </div>
            <div className="rounded-md bg-white/50 p-3 dark:bg-white/8">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Droplets className="h-3.5 w-3.5" />
                rain now
              </div>
              <p className="font-semibold">{current.precipitation} mm</p>
            </div>
          </div>

          {today ? (
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md bg-white/50 p-3 dark:bg-white/8">
                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                  <Sunrise className="h-3.5 w-3.5" />
                  sunrise
                </div>
                <p className="font-semibold">{formatTime(today.sunrise)}</p>
              </div>
              <div className="rounded-md bg-white/50 p-3 dark:bg-white/8">
                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                  <Sunset className="h-3.5 w-3.5" />
                  sunset
                </div>
                <p className="font-semibold">{formatTime(today.sunset)}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {days.map((day) => (
              <div
                key={day.date}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md bg-white/42 px-3 py-2 text-xs dark:bg-white/8"
              >
                <div className="min-w-0">
                  <p className="font-medium">{formatDay(day.date)}</p>
                  <p className="truncate text-muted-foreground">
                    {describeWeatherCode(day.weatherCode)} / {day.precipitationProbabilityMax}% rain
                  </p>
                </div>
                <p className="font-semibold">
                  {Math.round(day.temperatureMin)} / {Math.round(day.temperatureMax)}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </WidgetShell>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short"
  }).format(new Date(value));
}

function formatLocation(location: WeatherLocation) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(", ");
}

function formatLocationDetail(location: WeatherLocation) {
  return [location.admin1, location.country].filter(Boolean).join(", ");
}
