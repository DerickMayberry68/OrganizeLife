import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
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
        .select('*')
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

  public addDocument(document: any): Observable<Document> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      this.toastService.error('Error', 'No household selected');
      return throwError(() => new Error('No household selected'));
    }

    const documentData = {
      household_id: householdId,
      name: document.name,
      type: document.type,
      file_path: document.filePath,
      file_size: document.fileSize,
      mime_type: document.mimeType,
      expiry_date: document.expiryDate ? (typeof document.expiryDate === 'string' ? document.expiryDate : document.expiryDate.toISOString().split('T')[0]) : null,
      notes: document.notes || null
    };

    return from(
      this.supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single()
    ).pipe(
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
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.fileType !== undefined) updateData.file_type = updates.fileType;
    if (updates.fileSize !== undefined) updateData.file_size = updates.fileSize;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.expiryDate !== undefined) {
      updateData.expiry_date = updates.expiryDate 
        ? (typeof updates.expiryDate === 'string' ? updates.expiryDate : updates.expiryDate.toISOString().split('T')[0])
        : null;
    }
    if (updates.isImportant !== undefined) updateData.is_important = updates.isImportant;

    return from(
      this.supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
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
    return from(
      this.supabase
        .from('documents')
        .delete()
        .eq('id', id)
    ).pipe(
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
      category: data.category || 'other',
      uploadDate: data.upload_date ? new Date(data.upload_date) : (data.created_at ? new Date(data.created_at) : new Date()),
      fileType: data.file_type || data.mime_type || '',
      fileSize: data.file_size || 0,
      tags: data.tags || [],
      expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
      isImportant: data.is_important || false,
      url: data.url || data.file_path || ''
    };
  }

  private mapDocumentsFromSupabase(data: any[]): Document[] {
    return data.map(item => this.mapDocumentFromSupabase(item));
  }
}
