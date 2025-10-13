import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AppMenuService {
	getAppMenus() {
		return [
			// Dashboard - Always visible at top
			{
				'icon': 'fa fa-tachometer-alt',
				'title': 'Dashboard',
				'url': '/dashboard'
			},
			// Financial Management Category
			{
				'icon': 'fa fa-dollar-sign',
				'title': 'Financial Management',
				'caret': true,
				'submenu': [
					{
						'title': 'Overview',
						'url': '/financial'
					},
					{
						'title': 'Budgets',
						'url': '/budgets'
					},
					{
						'title': 'Categories',
						'url': '/categories'
					},
					{
						'title': 'Bills & Payments',
						'url': '/bills'
					},
					{
						'title': 'Payment History',
						'url': '/payments'
					},
					{
						'title': 'Accounts',
						'url': '/accounts'
					}
				]
			},
			// Home & Property Category
			{
				'icon': 'fa fa-home',
				'title': 'Home & Property',
				'caret': true,
				'submenu': [
					{
						'title': 'Maintenance',
						'url': '/maintenance'
					},
					{
						'title': 'Inventory',
						'url': '/inventory'
					},
					{
						'title': 'Documents',
						'url': '/documents'
					}
				]
			},
			// Personal & Family Category
			{
				'icon': 'fa fa-users',
				'title': 'Personal & Family',
				'caret': true,
				'submenu': [
					{
						'title': 'Healthcare',
						'url': '/healthcare'
					},
					{
						'title': 'Insurance',
						'url': '/insurance'
					}
				]
			},
			// Alerts - Top level for quick access
			{
				'icon': 'fa fa-bell',
				'title': 'Alerts',
				'url': '/alerts',
				'badge': '0' // Can be dynamically updated
			}
		];
	}
}