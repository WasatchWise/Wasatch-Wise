'use client';

import { useEffect, useState, useCallback } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  city: string;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  icon: string;
  condition: string;
}

export default function WeatherWidget() {
  const [current, setCurrent] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);

  const fetchWeather = useCallback(async () => {
    try {
      // Using OpenWeather API
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo';

      // Fetch current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Salt Lake City,US&appid=${API_KEY}&units=imperial`
      );

      // Fetch 3-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=Salt Lake City,US&appid=${API_KEY}&units=imperial&cnt=24`
      );

      if (!currentRes.ok || !forecastRes.ok) {
        // Fallback to mock data if API fails
        setCurrent({
          temp: 65,
          condition: 'Partly Cloudy',
          icon: '☁️',
          city: 'SLC'
        });
        setForecast([
          { day: 'Today', high: 68, low: 52, icon: '☁️', condition: 'Partly Cloudy' },
          { day: 'Tomorrow', high: 72, low: 54, icon: '☀️', condition: 'Sunny' },
          { day: 'Sun', high: 70, low: 50, icon: '🌤️', condition: 'Mostly Sunny' }
        ]);
        setLoading(false);
        return;
      }

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      // Current weather
      setCurrent({
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        icon: getWeatherEmojiFromId(currentData.weather[0].id),
        city: 'SLC'
      });

      // 3-day forecast from 5-day/3-hour forecast data
      // Group by day and get min/max temps
      const dailyForecasts: Record<string, any> = {};

      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        if (!dailyForecasts[dateKey]) {
          dailyForecasts[dateKey] = {
            date,
            temps: [],
            conditions: [],
            weatherIds: []
          };
        }

        dailyForecasts[dateKey].temps.push(item.main.temp);
        dailyForecasts[dateKey].conditions.push(item.weather[0].main);
        dailyForecasts[dateKey].weatherIds.push(item.weather[0].id);
      });

      // Convert to 3-day forecast
      const forecastDays = Object.entries(dailyForecasts)
        .slice(0, 3)
        .map(([dateKey, data]: [string, any], index) => {
          const date = data.date;
          const dayName = index === 0 ? 'Today' :
                         index === 1 ? 'Tomorrow' :
                         date.toLocaleDateString('en-US', { weekday: 'short' });

          const high = Math.round(Math.max(...data.temps));
          const low = Math.round(Math.min(...data.temps));
          const mostCommonId = data.weatherIds.sort((a:number, b:number) =>
            data.weatherIds.filter((v:number) => v===a).length -
            data.weatherIds.filter((v:number) => v===b).length
          ).pop();

          return {
            day: dayName,
            high,
            low,
            icon: getWeatherEmojiFromId(mostCommonId),
            condition: data.conditions[0]
          };
        });

      setForecast(forecastDays);
      setLoading(false);
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Use fallback data
      setCurrent({
        temp: 65,
        condition: 'Partly Cloudy',
        icon: '☁️',
        city: 'SLC'
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  function getWeatherEmojiFromId(id: number): string {
    // OpenWeather condition IDs
    // https://openweathermap.org/weather-conditions
    if (id === 800) return '☀️'; // Clear
    if (id >= 801 && id <= 802) return '⛅'; // Few/scattered clouds
    if (id >= 803 && id <= 804) return '☁️'; // Broken/overcast clouds
    if (id >= 300 && id <= 321) return '🌧️'; // Drizzle
    if (id >= 500 && id <= 531) return '🌧️'; // Rain
    if (id >= 200 && id <= 232) return '⛈️'; // Thunderstorm
    if (id >= 600 && id <= 622) return '❄️'; // Snow
    if (id >= 701 && id <= 781) return '🌫️'; // Atmosphere (fog, mist, etc)
    return '🌤️'; // Default
  }

  if (loading || !current) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span className="animate-pulse">Loading weather...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Current Weather - Always Visible */}
      <button
        onClick={() => setShowForecast(!showForecast)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition border border-gray-700 hover:border-blue-500"
      >
        <span className="text-2xl">{current.icon}</span>
        <div className="text-left">
          <div className="text-white font-semibold">{current.temp}°F</div>
          <div className="text-xs text-gray-400">{current.city}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${showForecast ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 3-Day Forecast Dropdown */}
      {showForecast && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 z-50">
          <div className="text-xs text-gray-400 mb-2 font-semibold">3-Day Forecast</div>
          <div className="space-y-2">
            {forecast.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{day.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{day.day}</div>
                    <div className="text-xs text-gray-400">{day.condition}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{day.high}°</div>
                  <div className="text-xs text-gray-500">{day.low}°</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="mt-3 pt-2 border-t border-gray-800 text-xs text-gray-400">
            {forecast[0].high > 70 ? (
              <span>☀️ Perfect day for hiking!</span>
            ) : forecast[0].condition.toLowerCase().includes('snow') ? (
              <span>❄️ Great skiing weather!</span>
            ) : forecast[0].condition.toLowerCase().includes('rain') ? (
              <span>🌧️ Check out breweries today!</span>
            ) : (
              <span>🌤️ Ideal for outdoor adventures!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
