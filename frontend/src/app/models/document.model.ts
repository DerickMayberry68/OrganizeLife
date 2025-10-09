export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  uploadDate: Date;
  fileType: string;
  fileSize: number;
  tags: string[];
  expiryDate?: Date;
  isImportant: boolean;
  url: string;
}

export type DocumentCategory = 
  | 'legal'
  | 'financial'
  | 'medical'
  | 'insurance'
  | 'property'
  | 'personal'
  | 'other';

