import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { ToastService } from '../../services/toast.service';
import { StorageService } from '../../services/storage.service';
import { FileManagerService } from '../../services/file-manager.service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { GridModule, PageService, SortService, FilterService, GroupService } from '@syncfusion/ej2-angular-grids';
import { ChartModule, CategoryService, ColumnSeriesService, LegendService, TooltipService } from '@syncfusion/ej2-angular-charts';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { FileManagerModule, FileManagerAllModule, NavigationPaneService, ToolbarService, DetailsViewService } from '@syncfusion/ej2-angular-filemanager';
import { AppBarModule } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-documents',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StatCard,
    GridModule,
    ChartModule,
    DialogModule,
    ButtonModule,
    CheckBoxModule,
    DatePickerModule,
    TextBoxModule,
    DropDownListModule,
    UploaderModule,
    FileManagerAllModule,
    AppBarModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    PageService,
    SortService,
    FilterService,
    GroupService,
    CategoryService,
    ColumnSeriesService,
    LegendService,
    TooltipService,
    NavigationPaneService,
    ToolbarService,
    DetailsViewService
  ],
  templateUrl: './documents.html',
  styleUrl: './documents.scss'
})
export class Documents implements OnInit {
  @ViewChild('documentDialog') documentDialog!: DialogComponent;
  @ViewChild('fileManager') fileManager!: any;

  private readonly documentService = inject(DocumentService);
  private readonly storageService = inject(StorageService);
  private readonly fileManagerService = inject(FileManagerService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  protected readonly documents = this.documentService.documents;
  protected readonly isLoading = signal(false);

  // Computed values
  protected readonly totalDocuments = computed(() => this.documents().length);

  protected readonly importantDocuments = computed(() =>
    this.documents().filter(d => d.isImportant).length
  );

  protected readonly expiringDocuments = computed(() =>
    this.documents().filter(d => {
      if (!d.expiryDate) return false;
      const daysUntil = this.getDaysUntil(d.expiryDate);
      return daysUntil >= 0 && daysUntil <= 30;
    }).length
  );

  protected readonly totalSize = computed(() => {
    const bytes = this.documents().reduce((sum, d) => sum + d.fileSize, 0);
    return this.formatFileSize(bytes);
  });

  // Chart data with null safety
  protected readonly documentsByCategoryChart = computed(() => {
    const data = this.documents();
    if (!data || data.length === 0) return [];

    const categoryCounts = data.reduce((acc: any, doc) => {
      const category = doc.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([category, count]) => ({
      x: category.charAt(0).toUpperCase() + category.slice(1),
      y: count,
      text: `${category}: ${count} documents`
    }));
  });

  // Grid settings
  protected readonly pageSettings = { pageSize: 10 };
  protected readonly filterSettings = { type: 'Excel' };

  // Chart settings with proper types
  protected readonly primaryXAxis: any = {
    valueType: 'Category',
    title: 'Categories',
    labelIntersectAction: 'Rotate45'
  };
  protected readonly primaryYAxis: any = {
    title: 'Number of Documents',
    labelFormat: 'n0',
    minimum: 0
  };
  protected readonly chartTitle = 'Documents by Category';
  protected readonly tooltip = { enable: true, format: '${point.x}: ${point.y}' };
  protected readonly marker = {
    visible: true,
    height: 10,
    width: 10,
    dataLabel: { visible: false }
  };
  protected readonly chartBackground = 'white';
  protected readonly palettes = ['#d4af37', '#49b6d6', '#32a932', '#f59c1a', '#e74c3c'];

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

  // File Manager settings
  protected readonly fileManagerSettings: any = {
    view: 'Details',
    enableVirtualization: false,
    allowMultiSelection: true,
    showFileExtension: true,
    showThumbnail: true
  };

  // File Manager will use custom adapter - we'll handle operations via events
  protected readonly fileManagerAjaxSettings: any = {
    url: '/api/filemanager', // Placeholder - we'll handle via custom adapter
    getImageUrl: '/api/filemanager/GetImage',
    uploadUrl: '/api/filemanager/Upload',
    downloadUrl: '/api/filemanager/Download'
  };

  constructor() {
    // Debug: Log chart data changes
    effect(() => {
      const chartData = this.documentsByCategoryChart();
      console.log('Documents Chart Data:', chartData);
    });

    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      tags: [''],
      expiryDate: [null],
      isImportant: [false]
    });
  }

  ngOnInit(): void {
    // Load documents
    this.isLoading.set(true);
    this.documentService.loadDocuments().subscribe({
      next: (documents) => {
        console.log('Loaded documents:', documents.length);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.isLoading.set(false);
      }
    });
  }

  // File Manager event handlers
  protected onFileManagerSuccess(args: any): void {
    console.log('File Manager operation successful:', args);
    // Reload documents after successful operation
    this.documentService.loadDocuments().subscribe();
  }

  protected onFileManagerError(args: any): void {
    console.error('File Manager error:', args);
    this.toastService.error('Error', 'File operation failed');
  }

  protected onFileManagerBeforeSend(args: any): void {
    // Intercept File Manager requests and handle with our storage service
    const action = args.action;
    const path = args.path || '';
    
    switch (action) {
      case 'read':
        // Handle read operation
        this.fileManagerService.read(path).subscribe({
          next: (data) => {
            args.response = data;
          },
          error: (error) => {
            args.cancel = true;
            this.toastService.error('Error', 'Failed to load files');
          }
        });
        break;
      case 'createFolder':
        const folderName = args.data?.name || args.name;
        this.fileManagerService.createFolder(path, folderName).subscribe({
          next: (data) => {
            args.response = data;
          },
          error: (error) => {
            args.cancel = true;
            this.toastService.error('Error', 'Failed to create folder');
          }
        });
        break;
      case 'upload':
        const files = args.data?.files || [];
        this.fileManagerService.upload(files, path).subscribe({
          next: (data) => {
            args.response = data;
            // Also create document records for uploaded files
            files.forEach((file: File) => {
              this.documentService.uploadDocument(file, {
                title: file.name,
                isImportant: false
              }).subscribe();
            });
          },
          error: (error) => {
            args.cancel = true;
            this.toastService.error('Error', 'Failed to upload files');
          }
        });
        break;
      case 'delete':
        const items = args.data?.names || args.names || [];
        this.fileManagerService.delete(items).subscribe({
          next: (data) => {
            args.response = data;
          },
          error: (error) => {
            args.cancel = true;
            this.toastService.error('Error', 'Failed to delete files');
          }
        });
        break;
    }
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
      
      this.documentService.addDocument(document).subscribe({
        next: () => {
          this.documentDialog.hide();
          this.documentForm.reset({ isImportant: false });
        },
        error: (error) => {
          console.error('Error saving document:', error);
        }
      });
    }
  }

  // Utility methods
  protected formatDate(args: any): string {
    if (!args.value) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(args.value));
  }

  protected formatDateValue(date: Date): string {
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

  protected getDaysUntil(date: Date): number {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  protected getFileIcon(fileType: string): string {
    switch (fileType.toLowerCase()) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      default: return '📎';
    }
  }

  protected queryCellInfo(args: any): void {
    if (args.column?.field === 'category') {
      const category = args.data.category;
      args.cell.innerHTML = `<span class="badge badge--info">${category}</span>`;
    }
    if (args.column?.field === 'isImportant') {
      const isImportant = args.data.isImportant;
      if (isImportant) {
        args.cell.innerHTML = '<span class="badge badge--warning">Important</span>';
      } else {
        args.cell.innerHTML = '<span class="badge badge--default">Normal</span>';
      }
    }
  }
}

