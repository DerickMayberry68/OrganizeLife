import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-alert',
  imports: [CommonModule, RouterLink],
  templateUrl: './alert.html',
  styleUrl: './alert.scss'
})
export class AlertComponent {
  public readonly type = input<'info' | 'warning' | 'error' | 'success'>('info');
  public readonly message = input.required<string>();
  public readonly dismissible = input<boolean>(true);
  public readonly actionLabel = input<string>();
  public readonly actionRoute = input<string>();
  
  public readonly dismiss = output<void>();

  protected onDismiss(): void {
    this.dismiss.emit();
  }
}

