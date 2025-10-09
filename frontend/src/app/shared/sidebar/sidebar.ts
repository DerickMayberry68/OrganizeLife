import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  protected readonly isCollapsed = signal(false);
  
  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Financial', path: '/financial', icon: '💰' },
    { label: 'Bills', path: '/bills', icon: '📮', badge: 2 },
    { label: 'Maintenance', path: '/maintenance', icon: '🔧' },
    { label: 'Inventory', path: '/inventory', icon: '📦' },
    { label: 'Documents', path: '/documents', icon: '📄' },
    { label: 'Accounts', path: '/accounts', icon: '🏦' },
    { label: 'Insurance', path: '/insurance', icon: '🛡️' }
  ];

  protected toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }
}

