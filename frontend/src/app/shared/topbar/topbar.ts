import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);
  
  protected readonly isNotificationsOpen = signal(false);
  protected readonly isProfileOpen = signal(false);

  protected readonly user = {
    name: 'Estate Manager',
    role: 'Administrator',
    avatar: '👤',
    email: 'manager@thebutler.com'
  };

  // Get alerts from DataService
  protected readonly alerts = this.dataService.alerts;
  
  // Computed values
  protected readonly recentAlerts = computed(() => 
    this.alerts()
      .filter(a => !a.isDismissed)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5) // Show top 5 recent alerts
  );

  protected readonly notificationCount = computed(() => 
    this.alerts().filter(a => !a.isRead && !a.isDismissed).length
  );

  ngOnInit(): void {
    // Load alerts when component initializes
    this.dataService.loadAlerts().subscribe();
  }

  protected toggleNotifications(event?: Event): void {
    event?.stopPropagation();
    this.isNotificationsOpen.update(v => !v);
    this.isProfileOpen.set(false);
  }

  protected toggleProfile(event?: Event): void {
    event?.stopPropagation();
    this.isProfileOpen.update(v => !v);
    this.isNotificationsOpen.set(false);
  }

  protected closeDropdowns(): void {
    this.isNotificationsOpen.set(false);
    this.isProfileOpen.set(false);
  }

  protected viewAllAlerts(): void {
    this.router.navigate(['/alerts']);
    this.closeDropdowns();
  }

  protected markAlertAsRead(id: string, event: Event): void {
    event.stopPropagation();
    this.dataService.markAlertAsRead(id).subscribe();
  }

  protected navigateToAlert(alert: any): void {
    if (alert.actionUrl) {
      this.router.navigateByUrl(alert.actionUrl);
    } else {
      this.router.navigate(['/alerts']);
    }
    this.closeDropdowns();
  }

  protected getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  protected getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'Critical': return '🚨';
      case 'High': return '⚠️';
      case 'Medium': return 'ℹ️';
      case 'Low': return '✅';
      default: return '🔔';
    }
  }

  protected logout(): void {
    // Implement logout logic
    console.log('Logout clicked');
  }
}

