import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, AfterViewInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
export class Documents implements OnInit, AfterViewInit {
  @ViewChild('documentDialog') documentDialog!: DialogComponent;
  @ViewChild('fileManager') fileManager!: any;

  private readonly documentService = inject(DocumentService);
  private readonly storageService = inject(StorageService);
  private readonly fileManagerService = inject(FileManagerService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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
  // Note: We set these to prevent HTTP requests - all operations are handled in beforeSend
  protected readonly fileManagerAjaxSettings: any = {
    url: 'about:blank', // Use about:blank to prevent actual HTTP requests
    getImageUrl: 'about:blank',
    uploadUrl: 'about:blank',
    downloadUrl: 'about:blank'
  };

  // File Manager path settings - initialize with root
  protected readonly fileManagerPathSettings: any = {
    rootAliasName: 'Root'
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

  ngAfterViewInit(): void {
    // Force teal gradient on AppBar buttons
    setTimeout(() => {
      const buttons = document.querySelectorAll('.e-appbar.custom-appbar button.e-btn.e-primary');
      buttons.forEach((button: any) => {
        if (button && button.style) {
          button.style.background = 'linear-gradient(135deg, #108E91 0%, #20B6AA 100%)';
          button.style.backgroundColor = '#108E91';
          button.style.backgroundImage = 'linear-gradient(135deg, #108E91 0%, #20B6AA 100%)';
          button.style.color = 'white';
          button.style.border = 'none';
        }
      });
    }, 100);

    // Check for query parameter to open modal
    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'document') {
        // Use setTimeout to ensure dialog is ready
        setTimeout(() => {
          this.openDocumentDialog();
          // Remove query parameter from URL
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true
          });
        }, 200);
      }
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

    // File Manager will initialize automatically - no need to set path manually
    // The path will be set when the first read operation is performed
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
    // ALWAYS cancel the default HTTP request FIRST - we handle everything ourselves
    args.cancel = true;
    
    // Intercept File Manager requests and handle with our storage service
    // Normalize action to lowercase for case-insensitive handling
    const action = (args.action || '').toLowerCase();
    
    // Ensure path is always a string, default to empty string for root
    // File Manager may pass null/undefined, so we need to handle that
    let path = '';
    if (args.path !== null && args.path !== undefined) {
      if (typeof args.path === 'string') {
        path = args.path;
      } else if (args.path && typeof args.path === 'object' && args.path.path) {
        path = args.path.path;
      }
    }
    
    switch (action) {
      case 'read':
        // Handle read operation - ensure path is safe
        this.fileManagerService.read(path || '').subscribe({
          next: (data) => {
            // File Manager expects response to be set directly on args
            // Ensure all paths are strings to prevent .split() errors
            if (data && data.cwd) {
              data.cwd.filterPath = data.cwd.filterPath || '';
            }
            if (data && data.files) {
              data.files = data.files.map((file: any) => ({
                ...file,
                filterPath: file.filterPath || file.name || ''
              }));
            }
            args.response = data;
          },
          error: (error) => {
            console.error('File Manager read error:', error);
            // Return empty result to prevent File Manager from crashing
            args.response = {
              cwd: {
                name: 'Root',
                size: 0,
                dateModified: new Date().toISOString(),
                type: 'Folder',
                hasChild: false,
                isFile: false,
                isRoot: true,
                filterPath: ''
              },
              files: []
            };
            this.toastService.error('Error', 'Failed to load files');
          }
        });
        break;
      case 'create':
      case 'createfolder':
        // Handle folder creation
        const folderName = args.data?.name || args.name || '';
        if (!folderName) {
          this.toastService.error('Error', 'Folder name is required');
          args.response = { files: [] };
          return;
        }
        console.log('🔵 [Documents] Creating folder:', folderName, 'in path:', path);
        this.fileManagerService.createFolder(path, folderName).subscribe({
          next: (data) => {
            console.log('✅ [Documents] Folder created successfully:', data);
            args.response = data || { files: [] };
            // Reload file list after folder creation
            this.documentService.loadDocuments().subscribe();
          },
          error: (error) => {
            console.error('🔴 [Documents] File Manager createFolder error:', error);
            console.error('🔴 [Documents] Error details:', {
              message: error?.message,
              code: error?.code,
              statusCode: error?.statusCode,
              name: error?.name
            });
            args.response = { files: [] };
            // Provide more specific error message
            let errorMessage = 'Failed to create folder';
            if (error?.message?.includes('row-level security') || error?.message?.includes('RLS')) {
              errorMessage = 'Permission denied. Please check your Supabase RLS policies.';
            } else if (error?.message?.includes('already exists')) {
              errorMessage = 'Folder already exists';
            } else if (error?.message) {
              errorMessage = `Failed to create folder: ${error.message}`;
            }
            this.toastService.error('Error', errorMessage);
          }
        });
        break;
      case 'upload':
        const files = args.data?.files || args.files || [];
        if (!files || files.length === 0) {
          this.toastService.error('Error', 'No files selected');
          args.response = { files: [] };
          return;
        }
        this.fileManagerService.upload(files, path).subscribe({
          next: (data) => {
            args.response = data || { files: [] };
            // Also create document records for uploaded files
            files.forEach((file: File) => {
              this.documentService.uploadDocument(file, {
                title: file.name,
                isImportant: false
              }).subscribe({
                error: (error) => {
                  console.warn('Failed to create document record:', error);
                }
              });
            });
          },
          error: (error) => {
            console.error('File Manager upload error:', error);
            args.response = { files: [] };
            this.toastService.error('Error', 'Failed to upload files');
          }
        });
        break;
      case 'delete':
        const items = args.data?.names || args.names || [];
        if (!items || items.length === 0) {
          this.toastService.error('Error', 'No items selected');
          args.response = { files: [] };
          return;
        }
        this.fileManagerService.delete(items).subscribe({
          next: (data) => {
            args.response = data || { files: [] };
          },
          error: (error) => {
            console.error('File Manager delete error:', error);
            args.response = { files: [] };
            this.toastService.error('Error', 'Failed to delete files');
          }
        });
        break;
      case 'download':
        // Handle download operation
        const downloadPath = path || args.data?.path || '';
        if (!downloadPath) {
          this.toastService.error('Error', 'No file selected for download');
          return;
        }
        this.fileManagerService.download(downloadPath).subscribe({
          next: (blob) => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadPath.split('/').pop() || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            args.response = {};
          },
          error: (error) => {
            console.error('File Manager download error:', error);
            this.toastService.error('Error', 'Failed to download file');
          }
        });
        break;
      case 'getImage':
        // Handle getImage operation
        const imagePath = path || args.data?.path || '';
        if (!imagePath) {
          args.response = { url: '' };
          return;
        }
        this.fileManagerService.getImage(imagePath).subscribe({
          next: (url) => {
            args.response = { url: url };
          },
          error: (error) => {
            console.error('File Manager getImage error:', error);
            args.response = { url: '' };
          }
        });
        break;
      default:
        // For unknown operations, return empty response
        console.warn(`Unhandled File Manager action: ${action}`);
        args.response = { files: [] };
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

