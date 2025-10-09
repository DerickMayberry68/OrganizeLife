import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';

@Component({
  selector: 'app-documents',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    CheckBoxModule,
    DatePickerModule,
    TextBoxModule,
    DropDownListModule,
    UploaderModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './documents.html',
  styleUrl: './documents.scss'
})
export class Documents {
  @ViewChild('documentDialog') documentDialog!: DialogComponent;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);

  protected readonly documents = this.dataService.documents;

  // Dialog settings
  protected readonly dialogWidth = '500px';
  protected readonly animationSettings = { effect: 'Zoom' };
  protected readonly documentDialogButtons = [
    { click: () => this.saveDocument(), buttonModel: { content: 'Save', isPrimary: true } },
    { click: () => this.documentDialog.hide(), buttonModel: { content: 'Cancel' } }
  ];

  // Form group
  protected documentForm: FormGroup;

  // Dropdown data
  protected readonly categories = ['legal', 'financial', 'medical', 'insurance', 'property', 'personal', 'other'];

  constructor() {
    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      tags: [''],
      expiryDate: [null],
      isImportant: [false]
    });
  }

  protected openDocumentDialog(): void {
    this.documentForm.reset({
      isImportant: false
    });
    this.documentDialog.show();
  }

  protected saveDocument(): void {
    if (this.documentForm.valid) {
      const formValue = this.documentForm.value;
      const document = {
        id: Date.now().toString(),
        title: formValue.title,
        category: formValue.category,
        uploadDate: new Date(),
        fileType: 'PDF',
        fileSize: 0,
        tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()) : [],
        expiryDate: formValue.expiryDate || undefined,
        isImportant: formValue.isImportant,
        url: '#'
      };
      // Add to data service
      // this.dataService.addDocument(document);
      this.documentDialog.hide();
      this.documentForm.reset({ isImportant: false });
    }
  }

  protected formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
