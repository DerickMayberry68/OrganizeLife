import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'welcome-dashboard',
  templateUrl: './welcome-dashboard.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class WelcomeDashboardComponent implements OnInit {
  currentTime: string = '';
  currentDate: string = '';
  userName: string = 'User'; // This would typically come from a service
  quickStats = [
    { label: 'Active Fields', value: '12', icon: 'fa-seedling', color: 'text-success' },
    { label: 'Crop Health', value: '95%', icon: 'fa-heart', color: 'text-success' },
    { label: 'Weather Alerts', value: '2', icon: 'fa-exclamation-triangle', color: 'text-warning' },
    { label: 'Harvest Ready', value: '3', icon: 'fa-tractor', color: 'text-info' }
  ];

  ngOnInit() {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
  }

  private updateDateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
    this.currentDate = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}

