import { Component, Input, Output, EventEmitter } 		 from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'sidebar-right',
  templateUrl: './sidebar-right.component.html',
  standalone: true,
  imports: [CommonModule, NgScrollbarModule]
})

export class SidebarRightComponent {
	@Output() appSidebarEndMobileToggled = new EventEmitter<boolean>();
	
	toggleAppSidebarEndMobile(): void {
		this.appSidebarEndMobileToggled.emit(true);
	}
}
