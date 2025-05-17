
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export function SignupForm() {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect') || '/profile';

    useEffect(() => {
        if (!loading && user) {
            router.push(redirectPath);
        }
    }, [user, loading, router, redirectPath]);

    const handleGoogleSignUp = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Sign up failed", error);
        }
    };

    return (
        // Removed container and specific height/centering classes
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="items-center text-center">
                <Image src="/assets/google-logo.svg" alt="Google Logo" width={48} height={48} className="mb-4" data-ai-hint="logo google"/>
                <CardTitle className="text-2xl">Create your SnapRecipe Account</CardTitle>
                <CardDescription>Join SnapRecipe to save your culinary creations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    {loading ? (
                        <UserPlus className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Sign up with Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2 text-sm text-muted-foreground">
                <p>By signing up, you agree to our terms of service (not really, this is a demo).</p>
                <p>
                    Already have an account?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/login')}>
                        Log In
                    </Button>
                </p>
            </CardFooter>
        </Card>
    );
}
