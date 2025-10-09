import { Component, Input, Output, EventEmitter } 		 from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSettings } from '../../services/app-settings.service';
import { slideToggle } from '../../utils/slide-animations';

@Component({
  selector: 'float-sub-menu',
  templateUrl: './float-sub-menu.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})

export class FloatSubMenuComponent {
	@Input() menus: any;
	@Input() top: any;
	@Input() left: any;
	@Input() right: any;
	@Input() bottom: any;
	@Input() lineTop: any;
	@Input() lineBottom: any;
	@Input() arrowTop: any;
	@Input() arrowBottom: any;

	@Output() remainAppSidebarFloatSubMenu = new EventEmitter();
	@Output() hideAppSidebarFloatSubMenu = new EventEmitter();
	@Output() calculateFloatSubMenuPosition = new EventEmitter();
	
	expand: boolean = false;
	
  constructor(public appSettings: AppSettings) {
  }

	expandCollapseSubmenu(e: Event, currentMenu: any, allMenu: any, active: any): void {
		e.preventDefault();
		var targetItem = (e.target as HTMLElement).closest('.menu-item');
		var target = targetItem?.querySelector('.menu-submenu') as HTMLElement;
		slideToggle(target);
		this.calculateFloatSubMenuPosition.emit();
	}

	remainMenu(): void {
	  this.remainAppSidebarFloatSubMenu.emit(true);
	}

	hideMenu(): void {
	  this.hideAppSidebarFloatSubMenu.emit(true);
	}
}
