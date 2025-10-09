import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCard {
  public readonly title = input.required<string>();
  public readonly value = input.required<string | number>();
  public readonly icon = input.required<string>();
  public readonly trend = input<'up' | 'down' | 'neutral'>('neutral');
  public readonly trendValue = input<string>();
  public readonly variant = input<'default' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'primary'>('default');
  public readonly showViewDetail = input<boolean>(false);
}
