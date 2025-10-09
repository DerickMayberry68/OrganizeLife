import { Component, ViewChild, AfterViewInit, Input, ElementRef } 		 from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'panel',
  templateUrl: './panel.component.html',
  standalone: true,
  imports: [CommonModule]
})

export class PanelComponent implements AfterViewInit {
  @Input() title?: string;
  @Input() variant?: string;
  @Input() noBody?: boolean;
  @Input() noButton?: boolean;
  @Input() headerClass?: string;
  @Input() bodyClass?: string;
  @Input() footerClass?: string;
  @Input() panelClass?: string;
  
  @ViewChild('panelFooter', { static: false }) panelFooter?: ElementRef;
  expand = false; 
  reload = false;
  collapse = false;
  remove = false;
  showFooter = false;
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showFooter = (this.panelFooter) ? this.panelFooter.nativeElement && this.panelFooter.nativeElement.children.length > 0 : false;
    });
  }

  panelExpand(): void {
    this.expand = !this.expand;
  }
  panelReload(): void {
    this.reload = true;

    setTimeout(() => {
      this.reload = false;
    }, 1500);
  }
  panelCollapse(): void {
    this.collapse = !this.collapse;
  }
  panelRemove(): void {
    this.remove = !this.remove;
  }
}
