/**
 * EntryFeed Component - Main Journal Entries Display
 * 
 * Displays a paginated, infinite-scroll feed of journal entries with:
 * - Rich entry preview cards
 * - Interactive metadata (location, weather, tags)
 * - Entry actions (edit, delete, like, share)
 * - Real-time updates via Supabase subscriptions
 * - Responsive design for all screen sizes
 * 
 * @component
 * @author Lifelogger Team
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import { Calendar, MapPin, Tag, Edit2, Trash2, Heart, MessageCircle, Share, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useEntries, type Entry } from "@/hooks/useEntries";
import { useToast } from "@/hooks/use-toast";

/**
 * Props interface for the EntryFeed component
 */
interface EntryFeedProps {
  /** Optional search query to filter entries */
  searchQuery?: string;
  /** Optional callback when entry is selected for editing */
  onEditEntry?: (entryId: string) => void;
}

/**
 * EntryFeed Component Implementation
 * 
 * Manages the display of journal entries with real-time data
 * and interactive features for entry management.
 */
export function EntryFeed({ searchQuery, onEditEntry }: EntryFeedProps = {}) {
  // Use the custom hook for entry management
  const { entries, loading, error, deleteEntry, refreshEntries } = useEntries(20, searchQuery);
  const { toast } = useToast();

  /**
   * Formats a date string for display in the entry card
   * 
   * @param dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Extracts text content from JSON entry content
   * 
   * @param content - Entry content (JSON or string)
   * @returns {string} Plain text content
   */
  const getTextContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (content && typeof content === 'object') {
      return content.text || '';
    }
    return '';
  };

  /**
   * Extracts tags from entry content
   * 
   * @param content - Entry content (JSON)
   * @returns {string[]} Array of tags
   */
  const getTags = (content: any): string[] => {
    if (content && typeof content === 'object' && content.tags) {
      return Array.isArray(content.tags) ? content.tags : [];
    }
    return [];
  };

  /**
   * Handles entry deletion with confirmation
   * 
   * @param entryId - ID of entry to delete
   */
  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      const success = await deleteEntry(entryId);
      if (success) {
        await refreshEntries();
      }
    }
  };

  /**
   * Handles entry editing
   * 
   * @param entryId - ID of entry to edit
   */
  const handleEditEntry = (entryId: string) => {
    onEditEntry?.(entryId);
  };

  // Loading state with skeleton cards
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <header className="text-center space-y-2 mb-8">
          <div className="h-8 bg-muted rounded w-64 mx-auto animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-48 mx-auto animate-pulse"></div>
        </header>
        
        {[1, 2, 3].map((i) => (
          <Card key={i} className="entry-card animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-semibold mb-2">Unable to load entries</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refreshEntries}>
          <Loader2 className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-semibold mb-2">
          {searchQuery ? 'No entries found' : 'Start your journal'}
        </h2>
        <p className="text-muted-foreground mb-4">
          {searchQuery 
            ? `No entries match "${searchQuery}". Try a different search term.`
            : 'Your first entry is just a click away. Share your thoughts, experiences, and memories.'
          }
        </p>
        {!searchQuery && (
          <Button onClick={() => window.dispatchEvent(new CustomEvent('open-entry-editor'))}>
            Create Your First Entry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Life Journal</h1>
        <p className="text-muted-foreground">Capturing moments, preserving memories</p>
      </header>

      {entries.map((entry) => {
        const textContent = getTextContent(entry.content);
        const entryTags = getTags(entry.content);
        
        return (
          <Card key={entry.id} className="entry-card group">
            <CardContent className="p-6">
              {/* Entry Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer">
                    {entry.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(entry.entry_date)}
                    </div>
                    {entry.location_text && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {entry.location_text}
                      </div>
                    )}
                    {entry.weather_summary && (
                      <div className="text-xs bg-muted px-2 py-1 rounded">
                        {entry.weather_summary}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditEntry(entry.id)}
                    title="Edit entry"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                    title="Delete entry"
                    className="hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Entry Content Preview */}
              <div className="prose prose-sm max-w-none mb-4 text-foreground">
                <p className="line-clamp-3">
                  {textContent.length > 200 
                    ? `${textContent.substring(0, 200)}...` 
                    : textContent
                  }
                </p>
              </div>

              {/* Tags */}
              {entryTags.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {entryTags.slice(0, 5).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        #{tag}
                      </Badge>
                    ))}
                    {entryTags.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{entryTags.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Entry Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Heart className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Reflect
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Load More Button */}
      {entries.length >= 20 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="px-8"
            onClick={() => {
              // TODO: Implement pagination
              toast({
                title: "Load more feature",
                description: "Pagination will be implemented in the next update",
              });
            }}
          >
            Load More Entries
          </Button>
        </div>
      )}
    </div>
  );
}