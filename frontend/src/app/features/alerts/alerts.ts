import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { ToastService } from '../../services/toast.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { GridModule, PageService, SortService, FilterService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import type { Alert, AlertCategory, AlertSeverity } from '../../models/alert.model';

@Component({
  selector: 'app-alerts',
  imports: [
    CommonModule,
    StatCard,
    GridModule,
    DropDownListModule,
    AppBarModule,
    ButtonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PageService, SortService, FilterService, ToolbarService],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss'
})
export class Alerts implements OnInit {
  private readonly alertService = inject(AlertService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly alerts = this.alertService.alerts;
  protected readonly isLoading = signal(true);
  protected readonly selectedCategory = signal<string>('All');
  protected readonly selectedSeverity = signal<string>('All');

  // Computed values
  protected readonly filteredAlerts = computed(() => {
    let alerts = this.alerts();
    
    if (this.selectedCategory() !== 'All') {
      alerts = alerts.filter(a => a.category === this.selectedCategory());
    }
    
    if (this.selectedSeverity() !== 'All') {
      alerts = alerts.filter(a => a.severity === this.selectedSeverity());
    }
    
    return alerts.filter(a => !a.isDismissed);
  });

  protected readonly totalAlerts = computed(() => this.filteredAlerts().length);
  
  protected readonly unreadAlerts = computed(() => 
    this.filteredAlerts().filter(a => !a.isRead).length
  );
  
  protected readonly criticalAlerts = computed(() => 
    this.filteredAlerts().filter(a => a.severity === 'Critical').length
  );
  
  protected readonly highPriorityAlerts = computed(() => 
    this.filteredAlerts().filter(a => a.priority >= 3).length
  );

  // Grid settings
  protected readonly pageSettings = { pageSize: 15 };
  protected readonly filterSettings = { type: 'Excel' };
  protected readonly toolbar = ['Search'];

  // Filter options
  protected readonly categories = ['All', 'Bills', 'Maintenance', 'Healthcare', 'Insurance', 'Documents', 'Inventory', 'Budget', 'Financial', 'System'];
  protected readonly severities = ['All', 'Low', 'Medium', 'High', 'Critical'];

  ngOnInit(): void {
    this.loadAlerts();
  }

  private loadAlerts(): void {
    this.alertService.loadAlerts().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  protected onCategoryChange(event: any): void {
    this.selectedCategory.set(event.value);
  }

  protected onSeverityChange(event: any): void {
    this.selectedSeverity.set(event.value);
  }

  protected markAsRead(alert: Alert): void {
    if (alert.isRead) return;
    
    this.alertService.markAlertAsRead(alert.id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Alert marked as read');
      },
      error: (error) => {
        console.error('Error marking alert as read:', error);
        this.toastService.error('Error', 'Failed to mark alert as read');
      }
    });
  }

  protected dismissAlert(id: string): void {
    this.alertService.dismissAlert(id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Alert dismissed');
      },
      error: (error) => {
        console.error('Error dismissing alert:', error);
        this.toastService.error('Error', 'Failed to dismiss alert');
      }
    });
  }

  protected deleteAlert(id: string): void {
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'Delete Alert',
        text: 'Are you sure you want to delete this alert?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff5757',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.alertService.deleteAlert(id).subscribe({
            next: () => {
              this.toastService.success('Success', 'Alert deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting alert:', error);
              this.toastService.error('Error', 'Failed to delete alert');
            }
          });
        }
      });
    });
  }

  protected markAllAsRead(): void {
    const unread = this.filteredAlerts().filter(a => !a.isRead);
    if (unread.length === 0) {
      this.toastService.info('Info', 'No unread alerts');
      return;
    }

    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'Mark All as Read',
        text: `Mark ${unread.length} alerts as read?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1b76ff',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, mark all as read',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.alertService.markAllAlertsAsRead().subscribe({
            next: () => {
              this.toastService.success('Success', 'All alerts marked as read');
            },
            error: (error) => {
              console.error('Error marking all as read:', error);
              this.toastService.error('Error', 'Failed to mark all alerts as read');
            }
          });
        }
      });
    });
  }

  protected dismissAll(): void {
    const active = this.filteredAlerts();
    if (active.length === 0) {
      this.toastService.info('Info', 'No alerts to dismiss');
      return;
    }

    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'Dismiss All Alerts',
        text: `Dismiss ${active.length} alerts?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff8c42',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, dismiss all',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.alertService.dismissAllAlerts().subscribe({
            next: () => {
              this.toastService.success('Success', 'All alerts dismissed');
            },
            error: (error) => {
              console.error('Error dismissing all:', error);
              this.toastService.error('Error', 'Failed to dismiss all alerts');
            }
          });
        }
      });
    });
  }

  protected navigateToEntity(alert: Alert): void {
    if (!alert.actionUrl) return;
    
    // Mark as read when navigating
    if (!alert.isRead) {
      this.markAsRead(alert);
    }
    
    this.router.navigateByUrl(alert.actionUrl);
  }

  protected formatDate(args: any): string {
    if (!args.value) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(args.value));
  }

  protected getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  protected getSeverityIconEmoji(severity: string): string {
    switch (severity) {
      case 'Critical': return '🚨';
      case 'High': return '⚠️';
      case 'Medium': return 'ℹ️';
      case 'Low': return '✅';
      default: return '🔔';
    }
  }

  protected getSeverityClass(severity: string): string {
    switch (severity) {
      case 'Critical': return 'alert-item--critical';
      case 'High': return 'alert-item--high';
      case 'Medium': return 'alert-item--medium';
      case 'Low': return 'alert-item--low';
      default: return '';
    }
  }

  protected queryCellInfo(args: any): void {
    if (args.column?.field === 'severity') {
      const severity = args.data.severity;
      let badgeClass = '';
      switch (severity) {
        case 'Critical': badgeClass = 'badge--error'; break;
        case 'High': badgeClass = 'badge--warning'; break;
        case 'Medium': badgeClass = 'badge--info'; break;
        case 'Low': badgeClass = 'badge--success'; break;
      }
      args.cell.innerHTML = `<span class="badge ${badgeClass}">${severity}</span>`;
    }

    if (args.column?.field === 'category') {
      const category = args.data.category;
      args.cell.innerHTML = `<span class="badge badge--primary">${category}</span>`;
    }

    if (args.column?.field === 'isRead') {
      const isRead = args.data.isRead;
      if (!isRead) {
        args.cell.innerHTML = '<span class="unread-dot">●</span>';
      }
    }
  }
}

