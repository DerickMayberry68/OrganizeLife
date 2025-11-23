import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

/**
 * Storage Service
 * Handles file operations with Supabase Storage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly authService = inject(AuthService);
  
  private readonly BUCKET_NAME = 'household_documents';

  /**
   * Get household ID from auth service
   */
  private getHouseholdId(): string | null {
    return this.authService.getDefaultHouseholdId();
  }

  /**
   * Upload a file to Supabase Storage
   */
  uploadFile(file: File, path?: string): Observable<{ path: string; url: string }> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      return throwError(() => new Error('No household selected'));
    }

    // Create path: household_id/filename or household_id/path/filename
    const filePath = path 
      ? `${householdId}/${path}/${file.name}`
      : `${householdId}/${file.name}`;

    return from(
      this.supabaseService.client.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        
        // Get public URL
        const { data: urlData } = this.supabaseService.client.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(data.path);

        return {
          path: data.path,
          url: urlData.publicUrl
        };
      }),
      catchError(error => {
        console.error('Error uploading file:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Download a file from Supabase Storage
   */
  downloadFile(path: string): Observable<Blob> {
    return from(
      this.supabaseService.client.storage
        .from(this.BUCKET_NAME)
        .download(path)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data;
      }),
      catchError(error => {
        console.error('Error downloading file:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(path: string): string {
    const { data } = this.supabaseService.client.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * List files in a folder
   */
  listFiles(folderPath?: string): Observable<any[]> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      return throwError(() => new Error('No household selected'));
    }

    const path = folderPath 
      ? `${householdId}/${folderPath}`
      : `${householdId}`;

    return from(
      this.supabaseService.client.storage
        .from(this.BUCKET_NAME)
        .list(path, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data || [];
      }),
      catchError(error => {
        console.error('Error listing files:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a file from Supabase Storage
   */
  deleteFile(path: string): Observable<void> {
    return from(
      this.supabaseService.client.storage
        .from(this.BUCKET_NAME)
        .remove([path])
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return void 0;
      }),
      catchError(error => {
        console.error('Error deleting file:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a folder in Supabase Storage
   * Folders are created by uploading a .keep file
   */
  createFolder(folderPath: string): Observable<void> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      return throwError(() => new Error('No household selected'));
    }

    const fullPath = `${householdId}/${folderPath}/.keep`;
    
    // Create a placeholder file to create the folder
    const blob = new Blob([''], { type: 'text/plain' });
    const file = new File([blob], '.keep');

    return from(
      this.supabaseService.client.storage
        .from(this.BUCKET_NAME)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting if folder already exists
        })
    ).pipe(
      map(({ error }) => {
        if (error) {
          // If the error is "already exists", treat it as success
          // since the folder is already created
          const errorMessage = error.message || String(error);
          if (errorMessage.includes('already exists') || 
              errorMessage.includes('duplicate') ||
              errorMessage.includes('409')) {
            console.log('Folder already exists, treating as success:', fullPath);
            return void 0;
          }
          throw error;
        }
        return void 0;
      }),
      catchError(error => {
        // Handle "already exists" error gracefully
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('already exists') || 
            errorMessage.includes('duplicate') ||
            errorMessage.includes('409')) {
          console.log('Folder already exists, treating as success:', fullPath);
          return of(void 0); // Return success Observable
        }
        console.error('Error creating folder:', error);
        return throwError(() => error);
      })
    );
  }
}

