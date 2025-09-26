/**
 * Custom hook for handling multimedia file uploads
 * 
 * This hook provides functionality for:
 * - Image, audio, and video file uploads
 * - File validation and compression
 * - Progress tracking
 * - Storage management via Supabase Storage
 * - Integration with journal entries
 * 
 * @author Lifelogger Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

// Type definitions
export type MediaType = Tables<'media'>;
export type MediaInsert = Omit<MediaType, 'id' | 'created_at'>;

/**
 * Supported file types and their configurations
 */
export const SUPPORTED_FILE_TYPES = {
  images: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  audio: {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    maxSize: 50 * 1024 * 1024, // 50MB
    extensions: ['.mp3', '.wav', '.ogg', '.m4a'],
  },
  video: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxSize: 100 * 1024 * 1024, // 100MB
    extensions: ['.mp4', '.webm', '.ogv'],
  },
  documents: {
    mimeTypes: ['application/pdf', 'text/plain', 'application/zip'],
    maxSize: 25 * 1024 * 1024, // 25MB
    extensions: ['.pdf', '.txt', '.zip'],
  },
};

/**
 * Upload progress information
 */
export interface UploadProgress {
  fileName: string;
  progress: number;
  isComplete: boolean;
  error?: string;
}

/**
 * Hook return interface
 */
interface UseMediaUploadReturn {
  uploading: boolean;
  uploadProgress: UploadProgress[];
  uploadFiles: (files: FileList | File[], entryId?: string) => Promise<MediaType[]>;
  deleteMedia: (mediaId: string) => Promise<boolean>;
  getMediaUrl: (storagePath: string) => string;
  validateFile: (file: File) => { isValid: boolean; error?: string };
}

/**
 * Main hook for media upload functionality
 * 
 * @returns {UseMediaUploadReturn} Object containing upload functions and state
 */
export function useMediaUpload(): UseMediaUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Validates a file against supported types and size limits
   * 
   * @param file - File to validate
   * @returns {object} Validation result with isValid flag and optional error message
   */
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check if file type is supported
    const allSupportedTypes = Object.values(SUPPORTED_FILE_TYPES)
      .flatMap(type => type.mimeTypes);
    
    if (!allSupportedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not supported`
      };
    }

    // Check file size
    const fileTypeConfig = Object.values(SUPPORTED_FILE_TYPES)
      .find(config => config.mimeTypes.includes(file.type));
    
    if (fileTypeConfig && file.size > fileTypeConfig.maxSize) {
      const maxSizeMB = fileTypeConfig.maxSize / (1024 * 1024);
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      };
    }

    return { isValid: true };
  }, []);

  /**
   * Generates a unique file path for storage
   * 
   * @param fileName - Original file name
   * @param userId - User ID for folder organization
   * @returns {string} Unique storage path
   */
  const generateStoragePath = (fileName: string, userId: string): string => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    return `${userId}/${timestamp}-${randomId}${extension}`;
  };

  /**
   * Updates upload progress for a specific file
   * 
   * @param fileName - Name of the file being uploaded
   * @param progress - Upload progress percentage (0-100)
   * @param isComplete - Whether upload is complete
   * @param error - Optional error message
   */
  const updateProgress = (fileName: string, progress: number, isComplete: boolean, error?: string) => {
    setUploadProgress(prev => {
      const existing = prev.find(p => p.fileName === fileName);
      if (existing) {
        return prev.map(p => 
          p.fileName === fileName 
            ? { ...p, progress, isComplete, error }
            : p
        );
      } else {
        return [...prev, { fileName, progress, isComplete, error }];
      }
    });
  };

  /**
   * Uploads multiple files to Supabase Storage and creates media records
   * 
   * @param files - FileList or File array to upload
   * @param entryId - Optional entry ID to associate media with
   * @returns {Promise<MediaType[]>} Array of created media records
   */
  const uploadFiles = async (files: FileList | File[], entryId?: string): Promise<MediaType[]> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to upload files",
      });
      return [];
    }

    const fileArray = Array.from(files);
    const uploadedMedia: MediaType[] = [];
    
    setUploading(true);
    setUploadProgress([]);

    try {
      // Process each file
      for (const file of fileArray) {
        try {
          // Validate file
          const validation = validateFile(file);
          if (!validation.isValid) {
            updateProgress(file.name, 0, true, validation.error);
            toast({
              variant: "destructive",
              title: "Invalid file",
              description: `${file.name}: ${validation.error}`,
            });
            continue;
          }

          // Initialize progress
          updateProgress(file.name, 0, false);

          // Generate storage path
          const storagePath = generateStoragePath(file.name, user.id);

          // Upload file to Supabase Storage
          // Note: Progress tracking will be simulated since Supabase doesn't expose upload progress
          updateProgress(file.name, 50, false);
          
          const { data, error: uploadError } = await supabase.storage
            .from('media') // This bucket needs to be created
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            updateProgress(file.name, 0, true, uploadError.message);
            toast({
              variant: "destructive",
              title: "Upload failed",
              description: `Failed to upload ${file.name}: ${uploadError.message}`,
            });
            continue;
          }

          // Create media record in database
          const mediaData: MediaInsert = {
            user_id: user.id,
            entry_id: entryId || null,
            storage_path: data.path,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          };

          const { data: mediaRecord, error: dbError } = await supabase
            .from('media')
            .insert(mediaData)
            .select()
            .single();

          if (dbError) {
            console.error('Database error:', dbError);
            updateProgress(file.name, 100, true, 'Failed to save file record');
            
            // Clean up uploaded file
            await supabase.storage.from('media').remove([data.path]);
            continue;
          }

          updateProgress(file.name, 100, true);
          uploadedMedia.push(mediaRecord);

        } catch (error) {
          console.error('Error uploading file:', error);
          updateProgress(file.name, 0, true, 'Unexpected error occurred');
        }
      }

      if (uploadedMedia.length > 0) {
        toast({
          title: "Upload successful",
          description: `${uploadedMedia.length} file(s) uploaded successfully`,
        });
      }

    } catch (error) {
      console.error('Unexpected error during upload:', error);
      toast({
        variant: "destructive",
        title: "Upload error",
        description: "An unexpected error occurred during upload",
      });
    } finally {
      setUploading(false);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress([]), 3000);
    }

    return uploadedMedia;
  };

  /**
   * Deletes a media file and its storage
   * 
   * @param mediaId - ID of the media record to delete
   * @returns {Promise<boolean>} Success status
   */
  const deleteMedia = async (mediaId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get media record first
      const { data: media, error: fetchError } = await supabase
        .from('media')
        .select('storage_path')
        .eq('id', mediaId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !media) {
        console.error('Error fetching media:', fetchError);
        return false;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([media.storage_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }

      // Delete database record
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId)
        .eq('user_id', user.id);

      if (dbError) {
        console.error('Error deleting media record:', dbError);
        return false;
      }

      toast({
        title: "Media deleted",
        description: "File has been removed successfully",
      });

      return true;
    } catch (error) {
      console.error('Unexpected error deleting media:', error);
      return false;
    }
  };

  /**
   * Gets a public URL for a media file
   * 
   * @param storagePath - Storage path of the file
   * @returns {string} Public URL for the file
   */
  const getMediaUrl = (storagePath: string): string => {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  };

  return {
    uploading,
    uploadProgress,
    uploadFiles,
    deleteMedia,
    getMediaUrl,
    validateFile,
  };
}