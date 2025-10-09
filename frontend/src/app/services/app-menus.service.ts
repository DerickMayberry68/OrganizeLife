import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AppMenuService {
	getAppMenus() {
		return [{
			'icon': 'fa fa-tachometer-alt',
			'title': 'Dashboard',
			'url': '/dashboard'
		},{
			'icon': 'fa fa-dollar-sign',
			'title': 'Financial',
			'url': '/financial'
		},{
			'icon': 'fa fa-file-invoice-dollar',
			'title': 'Bills & Payments',
			'url': '/bills'
		},{
			'icon': 'fa fa-wrench',
			'title': 'Maintenance',
			'url': '/maintenance'
		},{
			'icon': 'fa fa-boxes',
			'title': 'Inventory',
			'url': '/inventory'
		},{
			'icon': 'fa fa-folder-open',
			'title': 'Documents',
			'url': '/documents'
		},{
			'icon': 'fa fa-university',
			'title': 'Accounts',
			'url': '/accounts'
		},{
			'icon': 'fa fa-shield-alt',
			'title': 'Insurance',
			'url': '/insurance'
		}];
	}
}