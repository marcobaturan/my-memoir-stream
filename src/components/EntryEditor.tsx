import { useState } from "react";
import { X, Save, Image, Mic, Video, Calendar, MapPin, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EntryEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntryEditor({ open, onOpenChange }: EntryEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [location, setLocation] = useState("");

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log({ title, content, tags, location });
    onOpenChange(false);
  };

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
          {/* Title */}
          <div className="space-y-2">
            <Input
              placeholder="What's on your mind today?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
            <Button variant="ghost" size="sm">
              <Image className="w-4 h-4 mr-1" />
              Photo
            </Button>
            <Button variant="ghost" size="sm">
              <Mic className="w-4 h-4 mr-1" />
              Audio
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4 mr-1" />
              Video
            </Button>
            <Button variant="ghost" size="sm">
              <Calendar className="w-4 h-4 mr-1" />
              Date
            </Button>
            <Button variant="ghost" size="sm">
              <MapPin className="w-4 h-4 mr-1" />
              Location
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Textarea
              placeholder="Write your story here... Share your thoughts, experiences, and memories."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] resize-none"
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <Input
                placeholder="Where are you?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

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
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Auto-saved • {new Date().toLocaleTimeString()}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}