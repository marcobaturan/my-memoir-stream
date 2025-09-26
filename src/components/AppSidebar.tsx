import { useState, useEffect } from "react";
import { Calendar, Search, PlusCircle, User, BookOpen, Tag, Clock, LogOut } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


export function AppSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setUserProfile(data);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    }
  };

  const displayName = userProfile?.full_name || userProfile?.username || user?.email?.split('@')[0] || 'User';
  const displayBio = userProfile?.bio || "Documenting life's beautiful moments, one entry at a time.";
  const avatarUrl = userProfile?.profile_picture_url;

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        {/* User Profile Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-16 h-16 border-2 border-sidebar-primary/20">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-lg font-semibold">
              {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h2 className="font-semibold text-sidebar-foreground text-lg">{displayName}</h2>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed max-w-[200px]">
              {displayBio}
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

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        <div className="text-xs text-sidebar-foreground/50 text-center">
          Lifelogger v1.0
        </div>
      </SidebarFooter>

      <EntryEditor open={editorOpen} onOpenChange={setEditorOpen} />
    </Sidebar>
  );
}