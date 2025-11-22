import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import type { Document } from '../models/document.model';

/**
 * Document Service
 * Handles document management operations using Supabase
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentService extends BaseApiService {
  private readonly authService = inject(AuthService);
  private readonly storageService = inject(StorageService);

  // Document signals
  private readonly documentsSignal = signal<Document[]>([]);

  // Public readonly accessors
  public readonly documents = this.documentsSignal.asReadonly();

  // Computed values
  public readonly expiringDocuments = computed(() =>
    this.documentsSignal().filter(d => {
      if (!d.expiryDate) return false;
      const daysUntilExpiry = (new Date(d.expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      return daysUntilExpiry < 30 && daysUntilExpiry > 0;
    })
  );

  /**
   * Get household ID from auth service
   */
  private getHouseholdId(): string | null {
    return this.authService.getDefaultHouseholdId();
  }

  // ===== DOCUMENTS =====

  public loadDocuments(): Observable<Document[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return from(
      this.supabase
        .from('documents')
        .select(`
          *,
          categories (id, name)
        `)
        .eq('household_id', householdId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const documents = this.mapDocumentsFromSupabase(response.data || []);
        this.documentsSignal.set(documents);
        return documents;
      }),
      catchError(error => {
        console.error('Error loading documents:', error);
        this.toastService.error('Error', 'Failed to load documents');
        return of([]);
      })
    );
  }

  /**
   * Upload a file and create document record
   */
  public uploadDocument(file: File, metadata: {
    title: string;
    categoryId?: string;
    expiryDate?: Date;
    isImportant?: boolean;
    description?: string;
  }): Observable<Document> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return throwError(() => new Error('No household selected'));
    }

    // Upload file to Supabase Storage first
    return from(this.getCurrentUserId()).pipe(
      switchMap((userId) => {
        if (!userId) {
          return throwError(() => new Error('User not authenticated'));
        }

        return this.storageService.uploadFile(file).pipe(
          switchMap(({ path, url }) => {
            // Get file extension for file_type
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
            
            const documentData: any = {
              household_id: householdId,
              title: metadata.title,
              file_name: file.name,
              file_path: path,
              file_type: fileExtension,
              file_size_bytes: file.size,
              category_id: metadata.categoryId || null,
              description: metadata.description || null,
              expiry_date: metadata.expiryDate ? (typeof metadata.expiryDate === 'string' ? metadata.expiryDate : metadata.expiryDate.toISOString().split('T')[0]) : null,
              is_important: metadata.isImportant || false,
              created_by: userId,
              updated_by: userId
            };

            return from(
              this.supabase
                .from('documents')
                .insert(documentData)
                .select(`
                  *,
                  categories (id, name)
                `)
                .single()
            );
          })
        );
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newDocument = this.mapDocumentFromSupabase(response.data);
        this.addToSignal(this.documentsSignal, newDocument);
        this.toastService.success('Success', 'Document uploaded successfully');
        return newDocument;
      }),
      catchError(error => {
        console.error('Error uploading document:', error);
        this.toastService.error('Error', 'Failed to upload document');
        return throwError(() => error);
      })
    );
  }

  /**
   * Legacy addDocument method - kept for backward compatibility
   */
  public addDocument(document: any): Observable<Document> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return throwError(() => new Error('No household selected'));
    }

    return from(this.getCurrentUserId()).pipe(
      switchMap((userId) => {
        if (!userId) {
          return throwError(() => new Error('User not authenticated'));
        }

        const documentData: any = {
          household_id: householdId,
          title: document.title || document.name,
          file_name: document.fileName || document.name || 'untitled',
          file_path: document.filePath || '',
          file_type: document.fileType || 'unknown',
          file_size_bytes: document.fileSize || 0,
          category_id: document.categoryId || null,
          description: document.description || null,
          expiry_date: document.expiryDate ? (typeof document.expiryDate === 'string' ? document.expiryDate : document.expiryDate.toISOString().split('T')[0]) : null,
          is_important: document.isImportant || false,
          created_by: userId,
          updated_by: userId
        };

        return from(
          this.supabase
            .from('documents')
            .insert(documentData)
            .select(`
              *,
              categories (id, name)
            `)
            .single()
        );
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const newDocument = this.mapDocumentFromSupabase(response.data);
        this.addToSignal(this.documentsSignal, newDocument);
        this.toastService.success('Success', 'Document added successfully');
        return newDocument;
      }),
      catchError(error => {
        console.error('Error adding document:', error);
        this.toastService.error('Error', 'Failed to add document');
        return throwError(() => error);
      })
    );
  }

  public updateDocument(id: string, updates: Partial<Document>): Observable<Document> {
    return from(this.getCurrentUserId()).pipe(
      switchMap((userId) => {
        if (!userId) {
          return throwError(() => new Error('User not authenticated'));
        }

        const updateData: any = {};
        
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
        if (updates.fileType !== undefined) updateData.file_type = updates.fileType;
        if (updates.fileSize !== undefined) updateData.file_size_bytes = updates.fileSize;
        if (updates.expiryDate !== undefined) {
          updateData.expiry_date = updates.expiryDate 
            ? (typeof updates.expiryDate === 'string' ? updates.expiryDate : updates.expiryDate.toISOString().split('T')[0])
            : null;
        }
        if (updates.isImportant !== undefined) updateData.is_important = updates.isImportant;
        
        updateData.updated_by = userId;

        return from(
          this.supabase
            .from('documents')
            .update(updateData)
            .eq('id', id)
            .select(`
              *,
              categories (id, name)
            `)
            .single()
        );
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        const updatedDocument = this.mapDocumentFromSupabase(response.data);
        this.updateInSignal(this.documentsSignal, updatedDocument);
        this.toastService.success('Success', 'Document updated successfully');
        return updatedDocument;
      }),
      catchError(error => {
        console.error('Error updating document:', error);
        this.toastService.error('Error', 'Failed to update document');
        return throwError(() => error);
      })
    );
  }

  public deleteDocument(id: string): Observable<void> {
    // First get the document to delete the file from storage
    return from(
      this.supabase
        .from('documents')
        .select('file_path')
        .eq('id', id)
        .single()
    ).pipe(
      switchMap((response) => {
        if (response.error) {
          throw response.error;
        }
        
        // Delete file from storage if path exists
        if (response.data?.file_path) {
          this.storageService.deleteFile(response.data.file_path).subscribe({
            error: (error) => {
              console.warn('Error deleting file from storage:', error);
              // Continue with database deletion even if storage deletion fails
            }
          });
        }
        
        // Delete from database
        return from(
          this.supabase
            .from('documents')
            .delete()
            .eq('id', id)
        );
      }),
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        this.removeFromSignal(this.documentsSignal, id);
        this.toastService.success('Success', 'Document deleted successfully');
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting document:', error);
        this.toastService.error('Error', 'Failed to delete document');
        return throwError(() => error);
      })
    );
  }

  // ===== MAPPING HELPERS =====

  private mapDocumentFromSupabase(data: any): Document {
    return {
      id: data.id,
      title: data.title || data.name || '',
      category: data.categories?.name || data.category || 'other',
      categoryId: data.category_id || data.categories?.id || null,
      uploadDate: data.upload_date ? new Date(data.upload_date) : (data.created_at ? new Date(data.created_at) : new Date()),
      fileType: data.file_type || data.mime_type || '',
      fileSize: data.file_size_bytes || data.file_size || 0,
      tags: data.tags || [],
      expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
      isImportant: data.is_important || false,
      url: data.file_path ? this.storageService.getPublicUrl(data.file_path) : (data.url || '')
    };
  }

  private mapDocumentsFromSupabase(data: any[]): Document[] {
    return data.map(item => this.mapDocumentFromSupabase(item));
  }
}
