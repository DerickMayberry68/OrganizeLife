import { Component, Input, Output, EventEmitter, Renderer2, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSettings } from '../../services/app-settings.service';
import { AuthService } from '../../services/auth.service';
import { slideToggle } from '../../utils/slide-animations';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class HeaderComponent implements OnDestroy {
  private authService = inject(AuthService);
  
  @Input() appSidebarTwo: any;
	@Output() appSidebarEndToggled = new EventEmitter<boolean>();
	@Output() appSidebarMobileToggled = new EventEmitter<boolean>();
	@Output() appSidebarEndMobileToggled = new EventEmitter<boolean>();
	
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

	logout(): void {
	  this.authService.logout();
	}

	ngOnDestroy(): void {
	  this.appSettings.appHeaderMegaMenuMobileToggled = false;
	}

  constructor(private renderer: Renderer2, public appSettings: AppSettings) {
  }
}
