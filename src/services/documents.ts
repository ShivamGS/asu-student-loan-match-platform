import { UploadedDocument } from '../types';

// ============================================
// DOCUMENT UPLOAD API SERVICES
// ============================================

/**
 * Upload a document file
 * TODO: Replace with actual AWS S3 upload via API
 */
export const uploadDocument = async (
  file: File,
  documentType: 'salary_slip' | 'loan_statement',
  userId: string
): Promise<UploadedDocument> => {
  try {
    // TODO: Upload to AWS S3 via API Gateway
    // 1. Get presigned URL from API
    // const presignedUrlResponse = await fetch('https://your-api.com/documents/upload-url', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ fileName: file.name, fileType: file.type, documentType })
    // });
    // const { uploadUrl, documentId } = await presignedUrlResponse.json();
    
    // 2. Upload file to S3
    // await fetch(uploadUrl, {
    //   method: 'PUT',
    //   body: file,
    //   headers: { 'Content-Type': file.type }
    // });
    
    // 3. Confirm upload and get document record
    // const confirmResponse = await fetch(`https://your-api.com/documents/${documentId}/confirm`, {
    //   method: 'POST'
    // });
    // return await confirmResponse.json();

    // MOCK IMPLEMENTATION
    await simulateFileUpload(file.size);

    const mockDocument: UploadedDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      documentType,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      status: 'uploaded',
    };

    // Store in localStorage for demo
    const existingDocs = getDocuments(userId);
    existingDocs.push(mockDocument);
    localStorage.setItem(`documents_${userId}`, JSON.stringify(existingDocs));

    return mockDocument;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload document. Please try again.');
  }
};

/**
 * Get all documents for a user
 * TODO: Replace with actual AWS API call
 */
export const getDocuments = (userId: string): UploadedDocument[] => {
  try {
    // TODO: GET from AWS API
    // const response = await fetch(`https://your-api.com/documents?userId=${userId}`);
    // return await response.json();

    // MOCK IMPLEMENTATION
    const stored = localStorage.getItem(`documents_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Get documents error:', error);
    return [];
  }
};

/**
 * Delete a document
 * TODO: Replace with actual AWS API call
 */
export const deleteDocument = async (documentId: string, userId: string): Promise<void> => {
  try {
    // TODO: DELETE from AWS API
    // await fetch(`https://your-api.com/documents/${documentId}`, {
    //   method: 'DELETE'
    // });

    // MOCK IMPLEMENTATION
    const existingDocs = getDocuments(userId);
    const filtered = existingDocs.filter(doc => doc.id !== documentId);
    localStorage.setItem(`documents_${userId}`, JSON.stringify(filtered));
  } catch (error) {
    console.error('Delete document error:', error);
    throw new Error('Failed to delete document.');
  }
};

/**
 * Update document status
 * TODO: This will be called by your backend after verification
 */
export const updateDocumentStatus = (
  documentId: string,
  userId: string,
  status: UploadedDocument['status'],
  notes?: string
): void => {
  try {
    const existingDocs = getDocuments(userId);
    const updated = existingDocs.map(doc => {
      if (doc.id === documentId) {
        return { ...doc, status, verificationNotes: notes };
      }
      return doc;
    });
    localStorage.setItem(`documents_${userId}`, JSON.stringify(updated));
  } catch (error) {
    console.error('Update status error:', error);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Simulate file upload progress
 */
const simulateFileUpload = (fileSize: number): Promise<void> => {
  // Simulate upload time based on file size (1MB = 500ms)
  const uploadTime = Math.min((fileSize / 1024 / 1024) * 500, 3000);
  return new Promise(resolve => setTimeout(resolve, uploadTime));
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF and image files (JPG, PNG) are allowed' };
  }

  return { valid: true };
};
