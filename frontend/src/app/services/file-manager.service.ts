import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { DocumentService } from './document.service';
import { AuthService } from './auth.service';

/**
 * File Manager Service
 * Adapter for Syncfusion File Manager to work with Supabase Storage
 */
@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  private readonly storageService = inject(StorageService);
  private readonly documentService = inject(DocumentService);
  private readonly authService = inject(AuthService);

  /**
   * Get household ID for path prefix
   */
  private getHouseholdId(): string | null {
    return this.authService.getDefaultHouseholdId();
  }

  /**
   * File Manager Read operation
   * Returns file/folder structure in File Manager format
   */
  read(path: string, showHiddenItems: boolean = false): Observable<any> {
    const householdId = this.getHouseholdId();
    if (!householdId) {
      return throwError(() => new Error('No household selected'));
    }

    // Remove household_id prefix if present
    const cleanPath = path.startsWith(householdId + '/') 
      ? path.substring(householdId.length + 1)
      : path;

    return this.storageService.listFiles(cleanPath || undefined).pipe(
      map((files) => {
        const result: any = {
          cwd: {
            name: cleanPath || 'Root',
            size: 0,
            dateModified: new Date().toISOString(),
            type: 'Folder',
            hasChild: true,
            isFile: false,
            isRoot: !cleanPath
          },
          files: files.map((file: any) => {
            const isFolder = !file.name || file.name.endsWith('/') || file.metadata?.mimetype === '';
            
            return {
              name: file.name,
              size: file.metadata?.size || 0,
              dateModified: file.updated_at || file.created_at || new Date().toISOString(),
              type: isFolder ? 'Folder' : 'File',
              hasChild: isFolder,
              isFile: !isFolder,
              filterPath: cleanPath ? `${cleanPath}/${file.name}` : file.name
            };
          })
        };

        return result;
      }),
      catchError(error => {
        console.error('Error reading files:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * File Manager CreateFolder operation
   */
  createFolder(path: string, name: string): Observable<any> {
    const folderPath = path ? `${path}/${name}` : name;
    
    return this.storageService.createFolder(folderPath).pipe(
      map(() => ({
        files: [{
          name: name,
          size: 0,
          dateModified: new Date().toISOString(),
          type: 'Folder',
          hasChild: true,
          isFile: false
        }]
      })),
      catchError(error => {
        console.error('Error creating folder:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * File Manager Upload operation
   */
  upload(files: File[], path: string): Observable<any> {
    const uploadObservables = files.map(file => 
      this.storageService.uploadFile(file, path).pipe(
        map(({ path: filePath }) => ({
          name: file.name,
          size: file.size,
          dateModified: new Date().toISOString(),
          type: 'File',
          hasChild: false,
          isFile: true,
          filterPath: filePath
        }))
      )
    );

    return from(Promise.all(uploadObservables.map(obs => from(obs).toPromise()))).pipe(
      map((results) => ({
        files: results
      })),
      catchError(error => {
        console.error('Error uploading files:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * File Manager Delete operation
   */
  delete(items: string[]): Observable<any> {
    const deleteObservables = items.map(path => 
      this.storageService.deleteFile(path)
    );

    return from(Promise.all(deleteObservables.map(obs => from(obs).toPromise()))).pipe(
      map(() => ({
        files: items.map(path => ({
          name: path.split('/').pop() || path,
          filterPath: path
        }))
      })),
      catchError(error => {
        console.error('Error deleting files:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * File Manager Download operation
   */
  download(path: string): Observable<Blob> {
    return this.storageService.downloadFile(path);
  }

  /**
   * File Manager GetImage operation
   */
  getImage(path: string): Observable<string> {
    const url = this.storageService.getPublicUrl(path);
    return from([url]);
  }
}

