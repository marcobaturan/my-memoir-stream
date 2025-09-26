import { useState } from "react";
import { Calendar, Search, PlusCircle, User, BookOpen, Tag, Clock } from "lucide-react";
import { EntryEditor } from "@/components/EntryEditor";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { EntryCalendar } from "@/components/EntryCalendar";

const mockUser = {
  name: "Alex Chen",
  bio: "Documenting life's beautiful moments, one entry at a time. Coffee enthusiast, weekend photographer, and avid reader.",
  avatar: "/placeholder.svg"
};

export function AppSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        {/* User Profile Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-16 h-16 border-2 border-sidebar-primary/20">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-lg font-semibold">
              {mockUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h2 className="font-semibold text-sidebar-foreground text-lg">{mockUser.name}</h2>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed max-w-[200px]">
              {mockUser.bio}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:ring-sidebar-ring"
          />
        </div>

        {/* Write Button */}
        <Button 
          onClick={() => setEditorOpen(true)}
          className="w-full bg-gradient-accent hover:bg-accent-light text-accent-foreground font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Write Entry
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        {/* Calendar */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-sidebar-foreground/80 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Activity Calendar
          </h3>
          <EntryCalendar />
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-sidebar-foreground/80 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Navigation
          </h3>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="sidebar-nav-item active">
                <Clock className="w-4 h-4" />
                Recent Entries
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="sidebar-nav-item">
                <Tag className="w-4 h-4" />
                Tags
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="sidebar-nav-item">
                <User className="w-4 h-4" />
                Profile
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/50 text-center">
          Lifelogger v1.0
        </div>
      </SidebarFooter>

      <EntryEditor open={editorOpen} onOpenChange={setEditorOpen} />
    </Sidebar>
  );
}