import { Injectable } from '@angular/core';

export interface ToastConfig {
  title: string;
  content: string;
  cssClass?: 'toast-success' | 'toast-error' | 'toast-warning' | 'toast-info';
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
        cssClass: config.cssClass || 'toast-info',
        icon: config.icon || 'ℹ️',
        timeOut: 4000,
        showCloseButton: true,
        position: { X: 'Right', Y: 'Top' }
      });
    }
  }

  public success(title: string, content: string): void {
    this.show({
      title,
      content,
      cssClass: 'toast-success',
      icon: '✓'
    });
  }

  public error(title: string, content: string): void {
    this.show({
      title,
      content,
      cssClass: 'toast-error',
      icon: '✕'
    });
  }

  public warning(title: string, content: string): void {
    this.show({
      title,
      content,
      cssClass: 'toast-warning',
      icon: '⚠'
    });
  }

  public info(title: string, content: string): void {
    this.show({
      title,
      content,
      cssClass: 'toast-info',
      icon: 'ℹ'
    });
  }
}

