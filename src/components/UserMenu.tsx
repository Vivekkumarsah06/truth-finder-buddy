import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Sparkles } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button
        variant="hero-outline"
        size="sm"
        onClick={() => navigate("/auth")}
        className="gap-2"
      >
        <User className="w-4 h-4" />
        Sign In for More
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hero" size="sm" className="gap-2">
          <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="w-3 h-3" />
          </div>
          <span className="max-w-[100px] truncate">
            {user.user_metadata?.username || user.email?.split('@')[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.email}</p>
          <div className="flex items-center gap-1 text-xs text-accent mt-1">
            <Sparkles className="w-3 h-3" />
            <span>10 API calls/minute</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
