
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button, buttonVariants } from '@/components/ui/button'; // Added buttonVariants
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, UserCircle, ChefHat, Home } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function AuthButton() {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();

  if (loading) {
    return <Skeleton className="h-10 w-24" />; // Keep width consistent with two buttons or nav items
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => signInWithGoogle()}>
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Button>
        <Button onClick={() => signInWithGoogle()}>
         Sign Up
        </Button>
      </div>
    );
  }

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle size={20} />;

  return (
    <div className="flex items-center gap-2 sm:gap-4"> {/* Outer container for desktop links and dropdown */}
      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-1">
        <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            <Home className="mr-2 h-4 w-4" /> Home
        </Link>
        <Link href="/my-recipes" className={buttonVariants({ variant: "ghost" })}>
            <ChefHat className="mr-2 h-4 w-4" /> My SnapRecipes
        </Link>
        <Link href="/profile" className={buttonVariants({ variant: "ghost" })}>
            <UserCircle className="mr-2 h-4 w-4" /> Profile
        </Link>
      </nav>

      {/* Avatar Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
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
          
          {/* Mobile-only Navigation Links in Dropdown */}
          <div className="md:hidden"> {/* Group mobile-only links and their separator */}
            <DropdownMenuItem asChild>
              <Link href="/" className="flex items-center cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/my-recipes" className="flex items-center cursor-pointer">
                <ChefHat className="mr-2 h-4 w-4" />
                My SnapRecipes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </div>
          
          <DropdownMenuItem onClick={signOutUser} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
