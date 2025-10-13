import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { GridModule, PageService, SortService, FilterService } from '@syncfusion/ej2-angular-grids';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-payments',
  imports: [
    CommonModule,
    StatCard,
    GridModule,
    AppBarModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PageService, SortService, FilterService],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments implements OnInit {
  private readonly dataService = inject(DataService);

  protected readonly payments = signal<any[]>([]);
  protected readonly isLoading = signal(true);

  protected readonly totalPayments = computed(() => this.payments().length);
  protected readonly totalAmount = computed(() => 
    this.payments().reduce((sum, p) => sum + (p.amount || 0), 0)
  );
  protected readonly recentPayments = computed(() => 
    this.payments().slice(0, 10)
  );

  protected readonly pageSettings = { pageSize: 15 };
  protected readonly filterSettings = { type: 'Excel' };
  protected readonly toolbar = ['Search'];

  ngOnInit(): void {
    this.dataService.loadPayments().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  protected formatCurrency(args: any): string {
    if (!args.value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(args.value);
  }

  protected formatCurrencyValue(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  protected formatDate(args: any): string {
    if (!args.value) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(args.value));
  }
}

