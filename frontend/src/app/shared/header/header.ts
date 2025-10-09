import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarModule } from '@syncfusion/ej2-angular-navigations';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, SidebarModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  protected readonly isMenuOpen = signal(false);
  protected readonly isMobile = signal(window.innerWidth < 768);
  
  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Financial', path: '/financial', icon: '💰' },
    { label: 'Inventory', path: '/inventory', icon: '📦' },
    { label: 'Documents', path: '/documents', icon: '📄' },
    { label: 'Accounts', path: '/accounts', icon: '🏦' },
    { label: 'Insurance', path: '/insurance', icon: '🛡️' },
    { label: 'Bills', path: '/bills', icon: '📮' },
    { label: 'Maintenance', path: '/maintenance', icon: '🔧' }
  ];

  protected toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
