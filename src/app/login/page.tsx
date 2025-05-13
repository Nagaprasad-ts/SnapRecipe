
"use client";

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/profile';


  useEffect(() => {
    if (!loading && user) {
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Successful sign-in will trigger the useEffect above
    } catch (error) {
      console.error("Sign in failed", error);
      // Optionally show an error toast to the user
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <Image src="/assets/google-logo.svg" alt="Google Logo" width={48} height={48} data-ai-hint="logo google" className="mb-4"/>
          <CardTitle className="text-2xl">Login to SnapRecipe</CardTitle>
          <CardDescription>Access your saved recipes and more by signing in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {loading ? (
              <LogIn className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p>New to SnapRecipe? Signing in will create an account for you.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
