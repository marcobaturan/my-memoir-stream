import { useState, useEffect } from "react";
import { Calendar, MapPin, Tag, Edit2, Trash2, Heart, MessageCircle, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Entry {
  id: string;
  title: string;
  content: string;
  date: string;
  location?: string;
  weather?: string;
  tags: string[];
  images?: string[];
  hasAudio?: boolean;
  hasVideo?: boolean;
}

// Mock data
const mockEntries: Entry[] = [
  {
    id: "1",
    title: "A Perfect Morning Walk",
    content: "Started my day with a refreshing walk through Central Park. The autumn leaves were absolutely stunning today, with vibrant oranges and reds painting the landscape. Met an elderly gentleman who shared stories about the park's history...",
    date: "2024-12-26T08:30:00Z",
    location: "Central Park, NYC",
    weather: "Sunny, 18°C",
    tags: ["nature", "exercise", "mindfulness"],
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop"],
    hasAudio: true,
  },
  {
    id: "2", 
    title: "Late Night Coding Session",
    content: "Deep dive into the new React 19 features tonight. The concurrent rendering improvements are fascinating. Spent hours experimenting with the new use() hook and automatic batching...",
    date: "2024-12-25T23:45:00Z",
    location: "Home Office",
    weather: "Clear, 15°C",
    tags: ["coding", "learning", "technology"],
  },
  {
    id: "3",
    title: "Family Dinner Memories",
    content: "Grandmother's secret recipe for apple pie never fails to bring the family together. The kitchen filled with laughter, stories, and the warm smell of cinnamon...",
    date: "2024-12-22T19:00:00Z",
    location: "Grandmother's House",
    weather: "Cloudy, 12°C",
    tags: ["family", "food", "traditions"],
    images: ["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=400&fit=crop"],
    hasVideo: true,
  },
];

export function EntryFeed() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading entries
    setTimeout(() => {
      setEntries(mockEntries);
      setLoading(false);
    }, 1000);
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
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

  return (
    <div className="space-y-6 p-6">
      <header className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Life Journal</h1>
        <p className="text-muted-foreground">Capturing moments, preserving memories</p>
      </header>

      {entries.map((entry) => (
        <Card key={entry.id} className="entry-card group">
          <CardContent className="p-6">
            {/* Entry Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {entry.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(entry.date)}
                  </div>
                  {entry.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {entry.location}
                    </div>
                  )}
                  {entry.weather && (
                    <div className="text-xs bg-muted px-2 py-1 rounded">
                      {entry.weather}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Entry Images */}
            {entry.images && entry.images.length > 0 && (
              <div className="mb-4">
                <img
                  src={entry.images[0]}
                  alt="Entry visual"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Entry Content */}
            <div className="prose prose-sm max-w-none mb-4 text-foreground">
              <p>{entry.content}</p>
            </div>

            {/* Media Indicators */}
            {(entry.hasAudio || entry.hasVideo) && (
              <div className="flex items-center gap-2 mb-4">
                {entry.hasAudio && (
                  <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    🎵 Audio
                  </div>
                )}
                {entry.hasVideo && (
                  <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    📹 Video
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
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
                Entry #{entry.id}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="px-8">
          Load More Entries
        </Button>
      </div>
    </div>
  );
}