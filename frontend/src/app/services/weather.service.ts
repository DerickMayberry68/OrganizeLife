import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor() {}

  getWeatherData(latitude: number = 35.749484, longitude: number = -90.962859): Observable<WeatherData> {
    const url = `${this.baseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit`;

    return from(fetch(url).then(res => res.json())).pipe(
      map(response => {
        const current = response.current;
        const daily = response.daily;
        return this.transformWeatherData(current, daily, latitude, longitude);
      }),
      catchError(error => {
        console.error('Error fetching weather data:', error);
        return of(this.getDefaultWeatherData());
      })
    );
  }

  private transformWeatherData(current: any, daily: any, lat: number, lon: number): WeatherData {
    // Process current weather data
    const currentData = {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      pressure: Math.round(current.surface_pressure),
      weatherCode: current.weather_code
    };

    // Process daily forecast data
    const dailyData = {
      weatherCode: daily.weather_code,
      temperatureMax: daily.temperature_2m_max,
      temperatureMin: daily.temperature_2m_min
    };

    return {
      location: this.getLocationName(lat, lon),
      temperature: currentData.temperature,
      condition: this.getWeatherCondition(currentData.weatherCode),
      icon: this.getWeatherIcon(currentData.weatherCode),
      humidity: currentData.humidity,
      windSpeed: currentData.windSpeed,
      pressure: currentData.pressure,
      uvIndex: 7, // Not available in current params, using default
      visibility: 10, // Not available in current params, using default
      forecast: this.generateForecast(dailyData)
    };
  }

  private getLocationName(lat: number, lon: number): string {
    // You can enhance this with reverse geocoding API if needed
    return `Farm Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
  }

  private getWeatherCondition(code: number): string {
    const conditions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return conditions[code] || 'Unknown';
  }

  private getWeatherIcon(code: number): string {
    const icons: { [key: number]: string } = {
      0: 'fa-sun',
      1: 'fa-sun',
      2: 'fa-cloud-sun',
      3: 'fa-cloud',
      45: 'fa-smog',
      48: 'fa-smog',
      51: 'fa-cloud-drizzle',
      53: 'fa-cloud-drizzle',
      55: 'fa-cloud-drizzle',
      56: 'fa-cloud-drizzle',
      57: 'fa-cloud-drizzle',
      61: 'fa-cloud-rain',
      63: 'fa-cloud-rain',
      65: 'fa-cloud-rain',
      66: 'fa-cloud-rain',
      67: 'fa-cloud-rain',
      71: 'fa-snowflake',
      73: 'fa-snowflake',
      75: 'fa-snowflake',
      77: 'fa-snowflake',
      80: 'fa-cloud-rain',
      81: 'fa-cloud-rain',
      82: 'fa-cloud-rain',
      85: 'fa-snowflake',
      86: 'fa-snowflake',
      95: 'fa-bolt',
      96: 'fa-bolt',
      99: 'fa-bolt'
    };
    return icons[code] || 'fa-cloud';
  }

  private generateForecast(dailyData: any): Array<{ day: string; high: number; low: number; condition: string; icon: string }> {
    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'];
    const forecast = [];

    for (let i = 0; i < Math.min(5, dailyData.weatherCode.length); i++) {
      forecast.push({
        day: days[i] || `Day ${i + 1}`,
        high: Math.round(dailyData.temperatureMax[i]),
        low: Math.round(dailyData.temperatureMin[i]),
        condition: this.getWeatherCondition(dailyData.weatherCode[i]),
        icon: this.getWeatherIcon(dailyData.weatherCode[i])
      });
    }

    return forecast;
  }

  private getDefaultWeatherData(): WeatherData {
    return {
      location: 'Farm Location',
      temperature: 72,
      condition: 'Partly Cloudy',
      icon: 'fa-cloud-sun',
      humidity: 65,
      windSpeed: 8,
      pressure: 1013,
      uvIndex: 7,
      visibility: 10,
      forecast: [
        { day: 'Today', high: 75, low: 58, condition: 'Partly Cloudy', icon: 'fa-cloud-sun' },
        { day: 'Tomorrow', high: 78, low: 62, condition: 'Sunny', icon: 'fa-sun' },
        { day: 'Wed', high: 73, low: 59, condition: 'Rain', icon: 'fa-cloud-rain' },
        { day: 'Thu', high: 70, low: 55, condition: 'Cloudy', icon: 'fa-cloud' },
        { day: 'Fri', high: 76, low: 60, condition: 'Sunny', icon: 'fa-sun' }
      ]
    };
  }

  // Method to get user's current location (optional)
  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject('Error getting location: ' + error.message);
        }
      );
    });
  }
}
