/**
 * Custom hook for managing journal entries
 * 
 * This hook provides CRUD operations for journal entries including:
 * - Creating new entries with multimedia support
 * - Reading entries with pagination and filtering
 * - Updating existing entries
 * - Deleting entries
 * - Real-time updates when entries change
 * 
 * @author Lifelogger Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

// Type definitions for better TypeScript support
export type Entry = Tables<'entries'>;
export type EntryInsert = Omit<Entry, 'id' | 'created_at' | 'updated_at'>;
export type EntryUpdate = Partial<EntryInsert>;

/**
 * Interface for entry creation/update operations
 */
export interface EntryFormData {
  title: string;
  content: any; // JSON content supporting rich text, images, etc.
  entry_date?: string;
  location_text?: string;
  weather_summary?: string;
  tags?: string[];
}

/**
 * Hook return interface defining all available entry operations
 */
interface UseEntriesReturn {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  createEntry: (data: EntryFormData) => Promise<Entry | null>;
  updateEntry: (id: string, data: EntryUpdate) => Promise<Entry | null>;
  deleteEntry: (id: string) => Promise<boolean>;
  refreshEntries: () => Promise<void>;
  searchEntries: (query: string) => Promise<Entry[]>;
  getEntriesByDate: (date: string) => Promise<Entry[]>;
}

/**
 * Main hook for entry management
 * 
 * @param limit - Number of entries to load per page (default: 10)
 * @param searchQuery - Optional search query to filter entries
 * @returns {UseEntriesReturn} Object containing entries data and CRUD operations
 */
export function useEntries(limit: number = 10, searchQuery?: string): UseEntriesReturn {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Loads entries from the database with pagination and optional search
   * Includes proper error handling and user feedback
   */
  const loadEntries = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(limit);

      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content->>'text'.ilike.%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error loading entries:', fetchError);
        setError('Failed to load entries');
        toast({
          variant: "destructive",
          title: "Error loading entries",
          description: fetchError.message,
        });
        return;
      }

      setEntries(data || []);
    } catch (err) {
      console.error('Unexpected error loading entries:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new journal entry
   * 
   * @param data - Entry form data including title, content, metadata
   * @returns {Promise<Entry | null>} Created entry or null if failed
   */
  const createEntry = async (data: EntryFormData): Promise<Entry | null> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to create entries",
      });
      return null;
    }

    try {
      // Prepare entry data with proper structure
      const entryData: EntryInsert = {
        user_id: user.id,
        title: data.title,
        content: {
          text: typeof data.content === 'string' ? data.content : data.content,
          tags: data.tags || [],
        },
        entry_date: data.entry_date || new Date().toISOString(),
        location_text: data.location_text || null,
        weather_summary: data.weather_summary || null,
      };

      const { data: newEntry, error } = await supabase
        .from('entries')
        .insert(entryData)
        .select()
        .single();

      if (error) {
        console.error('Error creating entry:', error);
        toast({
          variant: "destructive",
          title: "Failed to create entry",
          description: error.message,
        });
        return null;
      }

      // Update local state
      setEntries(prev => [newEntry, ...prev]);
      
      toast({
        title: "Entry created",
        description: "Your journal entry has been saved successfully",
      });

      return newEntry;
    } catch (err) {
      console.error('Unexpected error creating entry:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating the entry",
      });
      return null;
    }
  };

  /**
   * Updates an existing journal entry
   * 
   * @param id - Entry ID to update
   * @param data - Updated entry data
   * @returns {Promise<Entry | null>} Updated entry or null if failed
   */
  const updateEntry = async (id: string, data: EntryUpdate): Promise<Entry | null> => {
    if (!user) return null;

    try {
      const { data: updatedEntry, error } = await supabase
        .from('entries')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own entries
        .select()
        .single();

      if (error) {
        console.error('Error updating entry:', error);
        toast({
          variant: "destructive",
          title: "Failed to update entry",
          description: error.message,
        });
        return null;
      }

      // Update local state
      setEntries(prev => prev.map(entry => 
        entry.id === id ? updatedEntry : entry
      ));

      toast({
        title: "Entry updated",
        description: "Your changes have been saved",
      });

      return updatedEntry;
    } catch (err) {
      console.error('Unexpected error updating entry:', err);
      return null;
    }
  };

  /**
   * Deletes a journal entry
   * 
   * @param id - Entry ID to delete
   * @returns {Promise<boolean>} Success status
   */
  const deleteEntry = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own entries

      if (error) {
        console.error('Error deleting entry:', error);
        toast({
          variant: "destructive",
          title: "Failed to delete entry",
          description: error.message,
        });
        return false;
      }

      // Update local state
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast({
        title: "Entry deleted",
        description: "The entry has been removed from your journal",
      });

      return true;
    } catch (err) {
      console.error('Unexpected error deleting entry:', err);
      return false;
    }
  };

  /**
   * Searches entries based on query string
   * Searches in title and content fields
   * 
   * @param query - Search query string
   * @returns {Promise<Entry[]>} Matching entries
   */
  const searchEntries = async (query: string): Promise<Entry[]> => {
    if (!user || !query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content->>'text'.ilike.%${query}%`)
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error searching entries:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Unexpected error searching entries:', err);
      return [];
    }
  };

  /**
   * Gets entries for a specific date
   * Useful for calendar integration
   * 
   * @param date - Date string in ISO format
   * @returns {Promise<Entry[]>} Entries for the specified date
   */
  const getEntriesByDate = async (date: string): Promise<Entry[]> => {
    if (!user) return [];

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', startOfDay.toISOString())
        .lte('entry_date', endOfDay.toISOString())
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error getting entries by date:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Unexpected error getting entries by date:', err);
      return [];
    }
  };

  /**
   * Refreshes the entries list from the database
   */
  const refreshEntries = async () => {
    await loadEntries();
  };

  // Load entries when component mounts or dependencies change
  useEffect(() => {
    loadEntries();
  }, [user, limit, searchQuery]);

  // Set up real-time subscription for entry changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('entries-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'entries',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          // Refresh entries when changes occur
          loadEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refreshEntries,
    searchEntries,
    getEntriesByDate,
  };
}