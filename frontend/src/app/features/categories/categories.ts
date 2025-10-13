import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { GridModule, PageService, SortService, FilterService } from '@syncfusion/ej2-angular-grids';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-categories',
  imports: [
    CommonModule,
    StatCard,
    GridModule,
    AppBarModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PageService, SortService, FilterService],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class Categories implements OnInit {
  private readonly dataService = inject(DataService);

  protected readonly categories = this.dataService.categories;
  protected readonly isLoading = signal(false);

  protected readonly totalCategories = computed(() => this.categories().length);
  protected readonly incomeCategories = computed(() => 
    this.categories().filter(c => c.type === 'Income').length
  );
  protected readonly expenseCategories = computed(() => 
    this.categories().filter(c => c.type === 'Expense').length
  );

  protected readonly pageSettings = { pageSize: 15 };
  protected readonly filterSettings = { type: 'Excel' };
  protected readonly toolbar = ['Search'];

  ngOnInit(): void {
    this.dataService.loadCategories().subscribe();
    setTimeout(() => this.isLoading.set(false));
  }

  protected queryCellInfo(args: any): void {
    if (args.column?.field === 'type') {
      const type = args.data.type;
      const badgeClass = type === 'Income' ? 'badge--success' : 'badge--error';
      args.cell.innerHTML = `<span class="badge ${badgeClass}">${type}</span>`;
    }
  }
}

