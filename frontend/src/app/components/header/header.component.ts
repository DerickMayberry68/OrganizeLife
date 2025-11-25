// src/app/components/header/header.component.ts

import { Component, Input, Output, EventEmitter, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppSettings } from '../../services/app-settings.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { slideToggle } from '../../utils/slide-animations';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class HeaderComponent {
  private auth = inject(AuthService);
  private alertService = inject(AlertService);
  public appSettings = inject(AppSettings);

  @Input() appSidebarTwo: any;
  @Output() appSidebarEndToggled = new EventEmitter<boolean>();
  @Output() appSidebarMobileToggled = new EventEmitter<boolean>();
  @Output() appSidebarEndMobileToggled = new EventEmitter<boolean>();

  // ───── Alerts (already perfect with signals) ─────
  protected readonly alerts = this.alertService.alerts;
  protected readonly recentAlerts = computed(() =>
    this.alerts()
      .filter(a => !a.isDismissed)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );
  protected readonly notificationCount = this.alertService.unreadAlertsCount;

  // ───── User Info — Now Pure Signals! (No getCurrentUser() needed) ─────
  protected readonly user = this.auth.currentUser$;           // readonly signal
  protected readonly isAuthenticated = this.auth.isAuthenticated; // computed boolean
  protected readonly userDisplayName = this.auth.userName;    // already computed!

  protected readonly userInitials = computed(() => {
    const u = this.user();
    if (!u) return 'U';
    if (u.firstName && u.lastName) {
      return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    }
    if (u.firstName) return u.firstName[0].toUpperCase();
    return u.email[0].toUpperCase();
  });

  // ───── Quick Actions Drawer ─────
  protected readonly isQuickActionsOpen = signal(false);

  toggleQuickActions(): void {
    this.isQuickActionsOpen.update(value => !value);
  }

  closeQuickActions(): void {
    this.isQuickActionsOpen.set(false);
  }

  // ───── UI Actions ─────
  toggleAppSidebarMobile() {
    this.appSidebarMobileToggled.emit(true);
  }

  toggleAppSidebarEnd() {
    this.appSidebarEndToggled.emit(true);
  }

  toggleAppSidebarEndMobile() {
    this.appSidebarEndMobileToggled.emit(true);
  }

  toggleAppTopMenuMobile() {
    const target = document.querySelector('.app-top-menu') as HTMLElement | null;
    if (target) slideToggle(target);
  }

  toggleAppHeaderMegaMenuMobile() {
    this.appSettings.appHeaderMegaMenuMobileToggled = !this.appSettings.appHeaderMegaMenuMobileToggled;
  }

  markAlertAsRead(id: string, event: Event) {
    event.stopPropagation();
    this.alertService.markAlertAsRead(id).subscribe();
  }

  logout() {
    this.auth.logout().subscribe();
  }

  getSeverityIcon(severity: string): string {
    return {
      'Critical': 'Emergency',
      'High': 'Warning',
      'Medium': 'Info',
      'Low': 'Check'
    }[severity] || 'Bell';
  }

  getRelativeTime(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  // Load alerts on init
  constructor() {
    this.alertService.loadAlerts().subscribe();
  }
}