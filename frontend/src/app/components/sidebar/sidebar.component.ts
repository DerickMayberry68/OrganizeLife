import { Component, Input, Output, EventEmitter, ElementRef, HostListener, ViewChild, OnInit, AfterViewChecked, AfterViewInit, inject } 		 from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMenuService } from '../../services/app-menus.service';
import { AppSettings } from '../../services/app-settings.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { slideUp, slideToggle } from '../../utils/slide-animations';
import { FloatSubMenuComponent } from '../float-sub-menu/float-sub-menu.component';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FloatSubMenuComponent]
})

export class SidebarComponent implements AfterViewChecked {
	private authService = inject(AuthService);
	menus: any[] = [];
	
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
	
	get userRole(): string {
	  const user = this.currentUser;
	  if (user?.households && user.households.length > 0) {
	    return user.households[0].role || 'Member';
	  }
	  return 'Member';
	}
	
	logout(): void {
	  this.authService.logout();
	}
	
  @ViewChild('sidebarScrollbar', { static: false }) private sidebarScrollbar?: ElementRef;
	@Output() appSidebarMinifiedToggled = new EventEmitter<boolean>();
	@Output() hideMobileSidebar = new EventEmitter<boolean>();
	@Output() setPageFloatSubMenu = new EventEmitter();
	
	@Output() appSidebarMobileToggled = new EventEmitter<boolean>();
	@Input() appSidebarTransparent: any;
	@Input() appSidebarGrid: any;
	@Input() appSidebarFixed: any;
	@Input() appSidebarMinified: any;
	
	appSidebarFloatSubMenu: any;
	appSidebarFloatSubMenuHide: any;
	appSidebarFloatSubMenuHideTime = 250;
	appSidebarFloatSubMenuTop: any;
	appSidebarFloatSubMenuLeft = '60px';
	appSidebarFloatSubMenuRight: any;
	appSidebarFloatSubMenuBottom: any;
	appSidebarFloatSubMenuArrowTop: any;
	appSidebarFloatSubMenuArrowBottom: any;
	appSidebarFloatSubMenuLineTop: any;
	appSidebarFloatSubMenuLineBottom: any;
	appSidebarFloatSubMenuOffset: any;

	mobileMode: boolean = false;
	desktopMode: boolean = true;
	scrollTop: number = 0;
	
  toggleNavProfile(e: Event): void {
		e.preventDefault();
	
		var targetSidebar = <HTMLElement>document.querySelector('.app-sidebar:not(.app-sidebar-end)');
		var targetMenu = (e.target as HTMLElement).closest('.menu-profile');
		var targetProfile = <HTMLElement>document.querySelector('#appSidebarProfileMenu');
		var expandTime = (targetSidebar && targetSidebar.getAttribute('data-disable-slide-animation')) ? 0 : 250;
	
		if (targetProfile && targetProfile.style && targetMenu) {
			if (targetProfile.style.display == 'block') {
				targetMenu.classList.remove('active');
			} else {
				targetMenu.classList.add('active');
			}
			slideToggle(targetProfile, expandTime);
			targetProfile.classList.toggle('expand');
		}
  }

	toggleAppSidebarMinified(): void {
		this.appSidebarMinifiedToggled.emit(true);
		this.scrollTop = 40;
	}
	
	toggleAppSidebarMobile(): void {
		this.appSidebarMobileToggled.emit(true);
	}

	calculateAppSidebarFloatSubMenuPosition(): void {
		var targetTop = this.appSidebarFloatSubMenuOffset.top;
    var direction = document.body.style.direction;
    var windowHeight = window.innerHeight;

    setTimeout(() => {
      let targetElm = <HTMLElement> document.querySelector('.app-sidebar-float-submenu-container');
      let targetSidebar = <HTMLElement> document.getElementById('sidebar');
      var targetHeight = targetElm.offsetHeight;
      this.appSidebarFloatSubMenuRight = 'auto';
      this.appSidebarFloatSubMenuLeft = (this.appSidebarFloatSubMenuOffset.width + targetSidebar.offsetLeft) + 'px';

      if ((windowHeight - targetTop) > targetHeight) {
        this.appSidebarFloatSubMenuTop = this.appSidebarFloatSubMenuOffset.top + 'px';
        this.appSidebarFloatSubMenuBottom = 'auto';
        this.appSidebarFloatSubMenuArrowTop = '20px';
        this.appSidebarFloatSubMenuArrowBottom = 'auto';
        this.appSidebarFloatSubMenuLineTop = '20px';
        this.appSidebarFloatSubMenuLineBottom = 'auto';
      } else {
        this.appSidebarFloatSubMenuTop = 'auto';
        this.appSidebarFloatSubMenuBottom = '0';

        var arrowBottom = (windowHeight - targetTop) - 21;
        this.appSidebarFloatSubMenuArrowTop = 'auto';
        this.appSidebarFloatSubMenuArrowBottom = arrowBottom + 'px';
        this.appSidebarFloatSubMenuLineTop = '20px';
        this.appSidebarFloatSubMenuLineBottom = arrowBottom + 'px';
      }
    }, 0);
	}

	showAppSidebarFloatSubMenu(menu: any, e: MouseEvent): void {
	  if (this.appSettings.appSidebarMinified) {
      clearTimeout(this.appSidebarFloatSubMenuHide);

      this.appSidebarFloatSubMenu = menu;
      if (e.target) {
        this.appSidebarFloatSubMenuOffset = (e.target as HTMLElement).getBoundingClientRect();
      }
      this.calculateAppSidebarFloatSubMenuPosition();
    }
	}

	hideAppSidebarFloatSubMenu(): void {
	  this.appSidebarFloatSubMenuHide = setTimeout(() => {
	    this.appSidebarFloatSubMenu = '';
	  }, this.appSidebarFloatSubMenuHideTime);
	}

	remainAppSidebarFloatSubMenu(): void {
		clearTimeout(this.appSidebarFloatSubMenuHide);
	}

  expandCollapseSubmenu(menu: any, allMenu: any[], active: any): void {
    // Toggle the expand/collapse state of a submenu
    if (menu.submenu) {
      menu.state = menu.state === 'expand' ? 'collapse' : 'expand';
    }
  }

  collapseAllMenus(): void {
    // Collapse all expanded menu categories
    this.menus.forEach(menu => {
      if (menu.submenu && menu.state === 'expand') {
        menu.state = 'collapse';
      }
    });
  }

  onMenuClick(menu: any): void {
    // If Dashboard is clicked, or any direct navigation item (not a category), collapse all other menus
    if (menu.url === '/dashboard' || (menu.url && !menu.submenu)) {
      this.collapseAllMenus();
    }
  }

	appSidebarSearch(e: any): void {
	  var targetValue = e.target.value;
	      targetValue = targetValue.toLowerCase();

    if (targetValue) {
			const elms = Array.from(document.querySelectorAll<HTMLElement>('.app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search), .app-sidebar:not(.app-sidebar-end) .menu-submenu > .menu-item'));
			elms.forEach(elm => elm.classList.add('d-none'));
			
			const elms2 = Array.from(document.querySelectorAll<HTMLElement>('.app-sidebar:not(.app-sidebar-end) .has-text'));
			elms2.forEach(elm => elm.classList.remove('has-text'));
			
			const elms3 = Array.from(document.querySelectorAll<HTMLElement>('.app-sidebar:not(.app-sidebar-end) .expand'));
			elms3.forEach(elm => elm.classList.remove('expand'));
			
			const elms4 = Array.from(document.querySelectorAll<HTMLElement>('.app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search) > .menu-link, .app-sidebar .menu-submenu > .menu-item > .menu-link'));
			elms4.forEach(elm => {
				const targetText = elm.textContent?.toLowerCase();
				if (targetText && targetText.search(targetValue) > -1) {
					const targetElm = elm.closest('.menu-item');
					if (targetElm) {
						targetElm.classList.remove('d-none');
						targetElm.classList.add('has-text');
					}
				
					const targetElm2 = elm.closest('.menu-item.has-sub');
					if (targetElm2) {
						const targetElm3 = targetElm2.querySelector('.menu-submenu .menu-item.d-none');
						if (targetElm3) {
							targetElm3.classList.remove('d-none');
						}
					}
				
					const targetElm4 = elm.closest('.menu-submenu') as HTMLElement | null;
					if (targetElm4) {
						targetElm4.style.display = 'block';
					
						const targetElm5 = targetElm4.querySelector('.menu-item:not(.has-text)');
						if (targetElm5) {
							targetElm5.classList.add('d-none');
						}
					
						const targetElm6 = elm.closest('.has-sub:not(.has-text)');
						if (targetElm6) {
							targetElm6.classList.remove('d-none');
							targetElm6.classList.add('expand');
						
							const targetElm7 = targetElm6.closest('.has-sub:not(.has-text)');
							if (targetElm7) {
								targetElm7.classList.remove('d-none');
								targetElm7.classList.add('expand');
							}
						}
					}
				}
			});
		} else {
			const elms5 = Array.from(document.querySelectorAll<HTMLElement>('.app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search).has-sub .menu-submenu'));
			elms5.forEach(elm => elm.removeAttribute('style'));
		
			const elms6 = Array.from(document.querySelectorAll<HTMLElement>('.app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search)'));
			elms6.forEach(elm => elm.classList.remove('d-none'));
		
			const elms7 = Array.from(document.querySelectorAll<HTMLElement>('.app-sidebar:not(.app-sidebar-end) .menu-submenu > .menu-item'));
			elms7.forEach(elm => elm.classList.remove('d-none'));
		
			const elms8 = Array.from(document.querySelectorAll<HTMLElement>('.app-sidebar:not(.app-sidebar-end) .expand'));
			elms8.forEach(elm => elm.classList.remove('expand'));
		}
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    this.scrollTop = (this.appSettings.appSidebarMinified) ? event.srcElement.scrollTop + 40 : 0;
    if (typeof(Storage) !== 'undefined') {
      localStorage.setItem('sidebarScroll', event.srcElement.scrollTop);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (window.innerWidth <= 767) {
      this.mobileMode = true;
      this.desktopMode = false;
    } else {
      this.mobileMode = false;
      this.desktopMode = true;
    }
  }

  ngAfterViewChecked(): void {
    if (typeof(Storage) !== 'undefined' && localStorage['sidebarScroll']) {
      if (this.sidebarScrollbar && this.sidebarScrollbar.nativeElement) {
        this.sidebarScrollbar.nativeElement.scrollTop = localStorage['sidebarScroll'];
      }
    }
  }
  
  ngAfterViewInit(): void {
    var handleSidebarMenuToggle = function(menus: any[], expandTime: number) {
			menus.map(function(menu: any) {
				menu.onclick = function(e: Event) {
					e.preventDefault();
					var target = this.nextElementSibling;
	
					menus.map(function(m: any) {
						var otherTarget = m.nextElementSibling;
						if (otherTarget !== target) {
							slideUp(otherTarget, expandTime);
							otherTarget.closest('.menu-item').classList.remove('expand');
							otherTarget.closest('.menu-item').classList.add('closed');
						}
					});
	
					var targetItemElm = target.closest('.menu-item');
			
					if (targetItemElm.classList.contains('expand') || (targetItemElm.classList.contains('active') && !target.style.display)) {
						targetItemElm.classList.remove('expand');
						targetItemElm.classList.add('closed');
						slideToggle(target, expandTime);
					} else {
						targetItemElm.classList.add('expand');
						targetItemElm.classList.remove('closed');
						slideToggle(target, expandTime);
					}
				}
			});
		};
	
		var targetSidebar       = document.querySelector('.app-sidebar:not(.app-sidebar-end)');
		var expandTime          = (targetSidebar && targetSidebar.getAttribute('data-disable-slide-animation')) ? 0 : 300;
		var disableAutoCollapse = (targetSidebar && targetSidebar.getAttribute('data-disable-auto-collapse')) ? 1 : 0;
	
		var menuBaseSelector = '.app-sidebar .menu > .menu-item.has-sub';
		var submenuBaseSelector = ' > .menu-submenu > .menu-item.has-sub';

		// menu
		var menuLinkSelector =  menuBaseSelector + ' > .menu-link';
		var menus = [].slice.call(document.querySelectorAll(menuLinkSelector));
		handleSidebarMenuToggle(menus, expandTime);

		// submenu lvl 1
		var submenuLvl1Selector = menuBaseSelector + submenuBaseSelector;
		var submenusLvl1 = [].slice.call(document.querySelectorAll(submenuLvl1Selector + ' > .menu-link'));
		handleSidebarMenuToggle(submenusLvl1, expandTime);

		// submenu lvl 2
		var submenuLvl2Selector = menuBaseSelector + submenuBaseSelector + submenuBaseSelector;
		var submenusLvl2 = [].slice.call(document.querySelectorAll(submenuLvl2Selector + ' > .menu-link'));
		handleSidebarMenuToggle(submenusLvl2, expandTime);
		
  }
  
	ngOnInit(): void {
		this.menus = this.appMenuService.getAppMenus(); 
		console.log(this.menus);
	}

  constructor(private eRef: ElementRef, public appSettings: AppSettings, private appMenuService: AppMenuService) {
    if (window.innerWidth <= 767) {
      this.mobileMode = true;
      this.desktopMode = false;
    } else {
      this.mobileMode = false;
      this.desktopMode = true;
    }
  }
}
