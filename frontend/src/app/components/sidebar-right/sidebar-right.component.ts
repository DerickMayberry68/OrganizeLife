import { Component, Input, Output, EventEmitter } 		 from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  selector: 'sidebar-right',
  templateUrl: './sidebar-right.component.html',
  standalone: true,
  imports: [CommonModule, CdkScrollable]
})

export class SidebarRightComponent {
	@Output() appSidebarEndMobileToggled = new EventEmitter<boolean>();
	
	toggleAppSidebarEndMobile(): void {
		this.appSidebarEndMobileToggled.emit(true);
	}
}
