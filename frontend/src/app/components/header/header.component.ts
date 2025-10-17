import { Component, Input, Output, EventEmitter, Renderer2, OnDestroy, OnInit, inject, computed } from '@angular/core';
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
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  
  @Input() appSidebarTwo: any;
	@Output() appSidebarEndToggled = new EventEmitter<boolean>();
	@Output() appSidebarMobileToggled = new EventEmitter<boolean>();
	@Output() appSidebarEndMobileToggled = new EventEmitter<boolean>();
	
	// Alerts
	protected readonly alerts = this.alertService.alerts;
	protected readonly recentAlerts = computed(() => 
    this.alerts()
      .filter(a => !a.isDismissed)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );
	protected readonly notificationCount = this.alertService.unreadAlertsCount;
	
	// Get current user info
	get currentUser() {
	  return this.authService.getCurrentUser();
	}
	
	get userDisplayName(): string {
	  const user = this.currentUser;
	  if (user?.firstName && user?.lastName) {
	    return `${user.firstName} ${user.lastName}`;
	  } else if (user?.firstName) {
	    return user.firstName;
	  } else if (user?.email) {
	    // Fallback to email if no name is available
	    return user.email.split('@')[0];
	  }
	  return 'User';
	}
	
	get userInitials(): string {
	  const user = this.currentUser;
	  if (user?.firstName && user?.lastName) {
	    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
	  } else if (user?.firstName) {
	    return user.firstName.charAt(0).toUpperCase();
	  } else if (user?.email) {
	    return user.email.charAt(0).toUpperCase();
	  }
	  return 'U';
	}
	
  toggleAppSidebarMobile(): void {
		this.appSidebarMobileToggled.emit(true);
  }
  
	toggleAppSidebarEnd(): void {
		this.appSidebarEndToggled.emit(true);
	}
	
  toggleAppSidebarEndMobile(): void {
		this.appSidebarEndMobileToggled.emit(true);
  }

	toggleAppTopMenuMobile(): void {
		var target = document.querySelector('.app-top-menu') as HTMLElement | null;
		if (target) {
			slideToggle(target);
		}
	}

	toggleAppHeaderMegaMenuMobile(): void {
	  this.appSettings.appHeaderMegaMenuMobileToggled = !this.appSettings.appHeaderMegaMenuMobileToggled;
	}

	ngOnInit(): void {
    this.alertService.loadAlerts().subscribe();
  }

	markAlertAsRead(id: string, event: Event): void {
    event.stopPropagation();
    this.alertService.markAlertAsRead(id).subscribe();
  }

	getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'Critical': return '🚨';
      case 'High': return '⚠️';
      case 'Medium': return 'ℹ️';
      case 'Low': return '✅';
      default: return '🔔';
    }
  }

	getRelativeTime(date: Date): string {
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

	logout(): void {
	  this.authService.logout();
	}

	ngOnDestroy(): void {
	  this.appSettings.appHeaderMegaMenuMobileToggled = false;
	}

  constructor(private renderer: Renderer2, public appSettings: AppSettings) {
  }
}
