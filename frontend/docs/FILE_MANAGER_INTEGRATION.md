# File Manager Integration with Supabase Storage

## Overview
This document describes the integration of Syncfusion File Manager with Supabase Storage for the documents page.

## What's Been Implemented

### 1. Storage Service (`src/app/services/storage.service.ts`)
- ✅ Created `StorageService` with methods for:
  - `uploadFile()` - Upload files to Supabase Storage bucket `household_documents`
  - `downloadFile()` - Download files from storage
  - `getPublicUrl()` - Get public URLs for files
  - `listFiles()` - List files in a folder
  - `deleteFile()` - Delete files from storage
  - `createFolder()` - Create folders in storage

### 2. File Manager Service (`src/app/services/file-manager.service.ts`)
- ✅ Created `FileManagerService` adapter that translates File Manager operations to Supabase Storage:
  - `read()` - List files/folders
  - `createFolder()` - Create folders
  - `upload()` - Upload files
  - `delete()` - Delete files
  - `download()` - Download files
  - `getImage()` - Get image URLs

### 3. Document Service Updates (`src/app/services/document.service.ts`)
- ✅ Updated to use Supabase Storage
- ✅ Added `uploadDocument()` method that:
  - Uploads file to Supabase Storage
  - Creates document record in database with `category_id` reference
  - Sets `created_by` and `updated_by` fields
- ✅ Updated `loadDocuments()` to join with categories table
- ✅ Updated `deleteDocument()` to also delete file from storage
- ✅ Updated mapping to get category name from joined table

### 4. Documents Component (`src/app/features/documents/documents.ts`)
- ✅ Added File Manager imports
- ✅ Added File Manager event handlers
- ✅ Configured File Manager settings

### 5. Documents Template (`src/app/features/documents/documents.html`)
- ✅ Added File Manager component
- ✅ Kept stats cards and charts

## What Needs to Be Done

### 1. Supabase Storage Bucket Setup
You need to create the `household_documents` bucket in Supabase:
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `household_documents`
3. Set it to **Private** (recommended) or **Public** based on your needs
4. Configure RLS policies to allow:
   - `SELECT` - Users can read their household's documents
   - `INSERT` - Users can upload to their household's folder
   - `UPDATE` - Users can update their household's documents
   - `DELETE` - Users can delete their household's documents

### 2. RLS Policy Example
```sql
-- Allow users to access their household's documents
CREATE POLICY "Users can access their household documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'household_documents' AND
  (storage.foldername(name))[1] = (
    SELECT household_id::text 
    FROM household_members 
    WHERE user_id = auth.uid() AND is_active = true
    LIMIT 1
  )
);
```

### 3. File Manager Custom Adapter
Syncfusion File Manager expects HTTP endpoints. The current implementation uses event handlers, but you may need to:

**Option A: Create HTTP Interceptor**
- Create an Angular HTTP interceptor that intercepts File Manager requests
- Route them to our `FileManagerService` methods
- Return responses in File Manager's expected format

**Option B: Use File Manager's Custom Adapter**
- Implement Syncfusion's `FileManagerAdapter` interface
- Override the File Manager's default HTTP behavior
- Connect directly to Supabase Storage

**Option C: Create Backend API Endpoints**
- Create API endpoints that File Manager can call
- These endpoints would use our `FileManagerService` internally

### 4. File Manager Configuration
The File Manager needs proper configuration. Update `fileManagerAjaxSettings` in `documents.ts`:

```typescript
protected readonly fileManagerAjaxSettings: any = {
  // If using custom adapter, these can be placeholders
  url: '/api/filemanager',
  getImageUrl: '/api/filemanager/GetImage',
  uploadUrl: '/api/filemanager/Upload',
  downloadUrl: '/api/filemanager/Download'
};
```

## Testing Checklist

- [ ] Create `household_documents` bucket in Supabase
- [ ] Configure RLS policies for the bucket
- [ ] Test file upload through File Manager
- [ ] Test file download through File Manager
- [ ] Test folder creation
- [ ] Test file deletion
- [ ] Verify files are stored in correct household folder structure
- [ ] Verify document records are created in database
- [ ] Test file listing and navigation

## File Structure in Storage

Files are stored with the following structure:
```
household_documents/
  {household_id}/
    {filename}
    {folder}/
      {filename}
```

## Next Steps

1. **Create the Supabase Storage bucket** (see above)
2. **Configure RLS policies** (see example above)
3. **Test the File Manager integration**
4. **Complete the custom adapter** if needed (see options above)
5. **Add error handling** for edge cases
6. **Add file type restrictions** if needed
7. **Add file size limits** if needed

## Notes

- The File Manager component is installed and imported
- The storage service is ready to use
- The document service is updated to work with storage
- The File Manager UI is added to the template
- The custom adapter needs to be completed based on your preferred approach

