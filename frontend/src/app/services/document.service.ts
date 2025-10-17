import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AuthService } from './auth.service';
import type { Document } from '../models/document.model';

/**
 * Document Service
 * Handles document management operations
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

  /**
   * Get auth headers
   */
  private getHeaders() {
    const headers = this.authService.getAuthHeaders();
    if (!headers.has('Content-Type')) {
      return {
        headers: headers.set('Content-Type', 'application/json')
      };
    }
    return { headers };
  }

  // ===== DOCUMENTS =====

  public loadDocuments(): Observable<Document[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      console.error('No household ID available');
      return of([]);
    }

    return this.http.get<Document[]>(
      `${this.API_URL}/Documents/household/${householdId}`,
      this.getHeaders()
    ).pipe(
      tap(documents => this.documentsSignal.set(documents)),
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
      return of({} as Document);
    }

    return this.http.post<Document>(
      `${this.API_URL}/Documents`,
      document,
      this.getHeaders()
    ).pipe(
      tap(newDocument => {
        this.addToSignal(this.documentsSignal, newDocument);
        this.toastService.success('Success', 'Document added successfully');
      }),
      catchError(error => {
        console.error('Error adding document:', error);
        this.toastService.error('Error', 'Failed to add document');
        throw error;
      })
    );
  }

  public updateDocument(id: string, updates: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(
      `${this.API_URL}/Documents/${id}`,
      updates,
      this.getHeaders()
    ).pipe(
      tap(updatedDocument => {
        this.updateInSignal(this.documentsSignal, updatedDocument);
        this.toastService.success('Success', 'Document updated successfully');
      }),
      catchError(error => {
        console.error('Error updating document:', error);
        this.toastService.error('Error', 'Failed to update document');
        throw error;
      })
    );
  }

  public deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/Documents/${id}`,
      this.getHeaders()
    ).pipe(
      tap(() => {
        this.removeFromSignal(this.documentsSignal, id);
        this.toastService.success('Success', 'Document deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting document:', error);
        this.toastService.error('Error', 'Failed to delete document');
        throw error;
      })
    );
  }
}

