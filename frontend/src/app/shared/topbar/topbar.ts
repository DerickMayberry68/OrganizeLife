import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar {
  protected readonly isNotificationsOpen = signal(false);
  protected readonly isProfileOpen = signal(false);

  protected readonly user = {
    name: 'Estate Manager',
    role: 'Administrator',
    avatar: '👤',
    email: 'manager@thebutler.com'
  };

  protected readonly notifications = signal<Notification[]>([
    {
      id: '1',
      title: 'Bill Due Soon',
      message: 'Electric bill due in 3 days',
      time: '5 min ago',
      type: 'warning'
    },
    {
      id: '2',
      title: 'Maintenance Complete',
      message: 'HVAC filter replacement completed',
      time: '1 hour ago',
      type: 'success'
    },
    {
      id: '3',
      title: 'Budget Alert',
      message: 'Groceries budget at 85%',
      time: '2 hours ago',
      type: 'warning'
    }
  ]);

  protected readonly notificationCount = signal(3);

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

  protected logout(): void {
    // Implement logout logic
    console.log('Logout clicked');
  }
}

