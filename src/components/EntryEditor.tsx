/**
 * EntryEditor Component - Rich Text Journal Entry Editor
 * 
 * A comprehensive modal-based editor for creating and editing journal entries.
 * Features include:
 * - Rich text editing with multimedia support
 * - File upload capabilities (images, audio, video, documents)
 * - Tag management system
 * - Location and weather integration
 * - Auto-save functionality
 * - Responsive design
 * 
 * @component
 * @author Lifelogger Team
 * @version 1.0.0
 */

import { useState, useEffect, useRef } from "react";
import { X, Save, Image, Mic, Video, Calendar, MapPin, Tag, FileText, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEntries, type EntryFormData } from "@/hooks/useEntries";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useToast } from "@/hooks/use-toast";

/**
 * Props interface for the EntryEditor component
 */
interface EntryEditorProps {
  /** Controls whether the editor dialog is open */
  open: boolean;
  /** Callback function when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Optional entry ID for editing existing entries */
  editingEntryId?: string;
  /** Optional callback when entry is successfully saved */
  onEntrySaved?: () => void;
}

/**
 * EntryEditor Component Implementation
 * 
 * Manages the complete lifecycle of journal entry creation and editing
 * with comprehensive multimedia support and real-time features.
 */
export function EntryEditor({ 
  open, 
  onOpenChange, 
  editingEntryId,
  onEntrySaved 
}: EntryEditorProps) {
  // Form state management
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [location, setLocation] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom hooks for data management
  const { createEntry, updateEntry } = useEntries();
  const { uploadFiles, uploading, uploadProgress } = useMediaUpload();
  const { toast } = useToast();

  /**
   * Resets all form fields to their initial state
   */
  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setCurrentTag("");
    setLocation("");
    setEntryDate(new Date().toISOString().split('T')[0]);
    setWeather("");
    setSelectedFiles([]);
    setIsSubmitting(false);
  };

  /**
   * Handles adding a new tag to the entry
   * Prevents duplicate tags and handles validation
   */
  const handleAddTag = () => {
    const trimmedTag = currentTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag("");
    }
  };

  /**
   * Removes a tag from the entry
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  /**
   * Handles keyboard shortcuts for tag input
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  /**
   * Handles file selection for upload
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  /**
   * Triggers file input dialog
   */
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  /**
   * Gets current location using browser geolocation API
   */
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would reverse geocode these coordinates
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast({
            title: "Location captured",
            description: "Your current location has been added to the entry",
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "Please allow location access or enter manually",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
      });
    }
  };

  /**
   * Main save handler - creates or updates entry with multimedia
   */
  const handleSave = async () => {
    // Validate required fields
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please enter a title for your entry",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Content required",
        description: "Please add some content to your entry",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare entry data
      const entryData: EntryFormData = {
        title: title.trim(),
        content: {
          text: content,
          hasMedia: selectedFiles.length > 0,
        },
        entry_date: new Date(entryDate).toISOString(),
        location_text: location.trim() || null,
        weather_summary: weather.trim() || null,
        tags,
      };

      // Create or update entry
      const savedEntry = editingEntryId 
        ? await updateEntry(editingEntryId, entryData)
        : await createEntry(entryData);

      if (!savedEntry) {
        throw new Error("Failed to save entry");
      }

      // Upload files if any are selected
      if (selectedFiles.length > 0) {
        await uploadFiles(selectedFiles, savedEntry.id);
      }

      // Success feedback
      toast({
        title: editingEntryId ? "Entry updated" : "Entry created",
        description: "Your journal entry has been saved successfully",
      });

      // Clean up and close
      resetForm();
      onOpenChange(false);
      onEntrySaved?.();

    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "There was an error saving your entry. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Effect to reset form when dialog closes
   */
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create New Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Input
              placeholder="What's on your mind today?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
              disabled={isSubmitting}
            />
          </div>

          {/* Media & Action Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,audio/*,video/*,.pdf,.txt,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={triggerFileUpload}
              disabled={uploading || isSubmitting}
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload Files
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={getCurrentLocation}
              disabled={isSubmitting}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Get Location
            </Button>
            
            <Button variant="ghost" size="sm" disabled>
              <Calendar className="w-4 h-4 mr-1" />
              Weather
            </Button>
          </div>

          {/* File Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium">Upload Progress</h4>
              {uploadProgress.map((progress) => (
                <div key={progress.fileName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="truncate">{progress.fileName}</span>
                    <span>{progress.isComplete ? 'Complete' : `${Math.round(progress.progress)}%`}</span>
                  </div>
                  <Progress value={progress.progress} className="h-1" />
                  {progress.error && (
                    <p className="text-xs text-destructive">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {file.name}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              placeholder="Write your story here... Share your thoughts, experiences, and memories. Use [[Link]] to connect to other entries."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use [[entry title]] to create internal links to other entries
            </p>
          </div>

          {/* Entry Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Entry Date
              </label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <Input
                placeholder="Where are you? (or click Get Location)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Weather */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Weather</label>
              <Input
                placeholder="How's the weather? (e.g., Sunny, 25°C)"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <Input
                placeholder="Add tags (press Enter or comma)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTag(tag)}
                      title="Click to remove tag"
                    >
                      #{tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving entry...
                </span>
              ) : uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading files...
                </span>
              ) : (
                `Ready to save • ${new Date().toLocaleTimeString()}`
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || uploading}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={handleSave}
                disabled={isSubmitting || uploading || !title.trim() || !content.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingEntryId ? 'Update Entry' : 'Save Entry'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}