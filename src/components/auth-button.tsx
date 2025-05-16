
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, UserCircle, ChefHat, Home, UserPlus } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Separator } from '@/components/ui/separator'; // Added for sheet layout

interface AuthButtonProps {
  renderForSheet?: boolean;
}

export function AuthButton({ renderForSheet = false }: AuthButtonProps) {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();

  if (loading) {
    // For sheet, a vertical skeleton might be better or simpler
    if (renderForSheet) {
      return (
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }
    return <Skeleton className="h-10 w-24 md:w-48" />; // Adjust skeleton for desktop
  }

  if (!user) {
    const commonButtonProps = "w-full justify-start text-left";
    const desktopButtonContainerClass = "flex-row items-center";
    const mobileButtonContainerClass = "flex-col pt-12"; // For sheet, this is effectively items-start

    return (
      <div className={`flex gap-2 ${renderForSheet ? "flex-col" : `${mobileButtonContainerClass} md:${desktopButtonContainerClass} md:pt-0`}`}>
        <Button 
          variant={renderForSheet ? "ghost" : "outline"} 
          onClick={() => signInWithGoogle()} 
          className={renderForSheet ? commonButtonProps : ""}
        >
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Button>
        <Button 
          onClick={() => signInWithGoogle()} 
          className={renderForSheet ? `bg-primary text-primary-foreground hover:bg-primary/90 ${commonButtonProps}` : ""}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Sign Up
        </Button>
      </div>
    );
  }

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle size={20} />;

  if (renderForSheet) {
    // Mobile Sheet Content: Render all items directly
    return (
      <div className="flex flex-col space-y-1 h-full">
        {/* User Info at the top of the sheet */}
        <div className="px-2 py-3 border-b mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-tight">{user.displayName || "User"}</p>
              <p className="text-xs leading-tight text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <Button asChild variant="ghost" className="w-full justify-start text-base py-3 h-auto">
          <Link href="/"><Home className="mr-3 h-5 w-5" />Home</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start text-base py-3 h-auto">
          <Link href="/my-recipes"><ChefHat className="mr-3 h-5 w-5" />My SnapRecipes</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start text-base py-3 h-auto">
          <Link href="/profile"><UserCircle className="mr-3 h-5 w-5" />Profile</Link>
        </Button>
        
        <Separator className="my-2" />
        
        {/* Logout Button */}
        <Button 
          variant="ghost" 
          onClick={signOutUser} 
          className="w-full justify-start text-base py-3 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-3 h-5 w-5" /> Log out
        </Button>
      </div>
    );
  } else {
    // Desktop Header: Direct Links + Avatar Dropdown
    return (
      <div className="flex items-center gap-1 md:gap-2">
        <Button asChild variant="ghost" className="hidden md:inline-flex items-center px-2 lg:px-3 h-10">
          <Link href="/" className="flex items-center">
            <Home className="h-5 w-5 lg:mr-2" />
            <span className="hidden lg:inline">Home</span>
          </Link>
        </Button>
        <Button asChild variant="ghost" className="hidden md:inline-flex items-center px-2 lg:px-3 h-10">
          <Link href="/my-recipes" className="flex items-center">
            <ChefHat className="h-5 w-5 lg:mr-2" />
            <span className="hidden lg:inline">My SnapRecipes</span>
          </Link>
        </Button>
        <Button asChild variant="ghost" className="hidden md:inline-flex items-center px-2 lg:px-3 h-10">
          <Link href="/profile" className="flex items-center">
            <UserCircle className="h-5 w-5 lg:mr-2" />
            <span className="hidden lg:inline">Profile</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-1 p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOutUser} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
}
