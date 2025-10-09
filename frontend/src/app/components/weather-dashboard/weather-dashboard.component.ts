import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService, WeatherData } from '../../services/weather.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'weather-dashboard',
  templateUrl: './weather-dashboard.component.html',
  styleUrls: ['./weather-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class WeatherDashboardComponent implements OnInit, OnDestroy {
  weatherData: WeatherData | null = null;
  isLoading = true;
  error: string | null = null;
  private weatherSubscription: Subscription | null = null;
  private refreshInterval: any;

  alerts = [
    { type: 'warning', message: 'High wind warning for tomorrow', icon: 'fa-exclamation-triangle' },
    { type: 'info', message: 'Rain expected Wednesday', icon: 'fa-cloud-rain' }
  ];

  weatherIcons = [
    { icon: 'fa-leaf' },
    { icon: 'fa-cloud' },
    { icon: 'fa-seedling' },
    { icon: 'fa-tint' },
    { icon: 'fa-thermometer-half' },
    { icon: 'fa-wind' }
  ];

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadWeatherData();
    // Refresh weather data every 10 minutes
    this.refreshInterval = setInterval(() => {
      this.loadWeatherData();
    }, 10 * 60 * 1000);
  }

  ngOnDestroy(): void {
    if (this.weatherSubscription) {
      this.weatherSubscription.unsubscribe();
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  protected loadWeatherData(): void {
    this.isLoading = true;
    this.error = null;

    this.weatherSubscription = this.weatherService.getWeatherData().subscribe({
      next: (data: WeatherData) => {
        this.weatherData = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load weather data';
        this.isLoading = false;
        console.error('Weather data error:', error);
      }
    });
  }

  getTemperatureColor(temp: number): string {
    if (temp >= 80) return 'text-danger';
    if (temp >= 70) return 'text-warning';
    if (temp >= 60) return 'text-success';
    return 'text-info';
  }

  getGaugeRotation(): number {
    if (!this.weatherData) return 0;
    
    // Convert temperature to gauge rotation (0-180 degrees for 0-100°F)
    const minTemp = 0;
    const maxTemp = 100;
    const minRotation = -90; // Start from left side
    const maxRotation = 90;  // End at right side
    
    const normalizedTemp = Math.max(minTemp, Math.min(maxTemp, this.weatherData.temperature));
    const rotation = minRotation + ((normalizedTemp - minTemp) / (maxTemp - minTemp)) * (maxRotation - minRotation);
    
    return rotation;
  }
}
  