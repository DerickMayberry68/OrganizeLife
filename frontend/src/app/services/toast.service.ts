import { Injectable } from '@angular/core';

export interface ToastConfig {
  title: string;
  content: string;
  cssClass?: 'e-toast-success' | 'e-toast-error' | 'e-toast-warning' | 'e-toast-info';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastObj: any;

  public setToastInstance(toast: any): void {
    this.toastObj = toast;
  }

  public show(config: ToastConfig): void {
    if (this.toastObj) {
      this.toastObj.show({
        title: config.title,
        content: config.content,
        cssClass: config.cssClass || 'e-toast-info',
        icon: config.icon || 'ℹ️',
        timeOut: 4000,
        showCloseButton: true,
        position: { X: 'Right', Y: 'Bottom' }
      });
    }
  }

  public success(title: string, content: string): void {
    this.show({
      title,
      content,
      cssClass: 'e-toast-success',
      icon: '✓'
    });
  }

  public error(title: string, content: string): void {
    this.show({
      title,
      content,
      cssClass: 'e-toast-error',
      icon: '✕'
    });
  }

  public warning(title: string, content: string): void {
    this.show({
      title,
      content,
      cssClass: 'e-toast-warning',
      icon: '⚠'
    });
  }

  public info(title: string, content: string): void {
    this.show({
      title,
      content,
      cssClass: 'e-toast-info',
      icon: 'ℹ'
    });
  }
}

