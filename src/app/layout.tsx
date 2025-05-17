
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SnapRecipeLogo } from '@/components/snap-recipe-logo';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { AuthButton } from '@/components/auth-button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button'; // Ensure Button is imported
import { Menu } from 'lucide-react';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SnapRecipe',
  description: 'Generate recipes from photos of your food!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background`}>
        <AuthProvider>
          <header className="px-4 md:px-6 lg:px-8 sticky top-0 z-50 w-full border-b-2 border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
            <div className="flex h-16 items-center justify-between w-full">
              <Link href="/" className="flex items-center">
                <SnapRecipeLogo />
              </Link>

              {/* Desktop Auth/Nav Buttons */}
              <div className="hidden md:flex items-center">
                <AuthButton renderForSheet={false} />
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-2">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm p-4">
                    <AuthButton renderForSheet={true} />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>
          <main className="flex-1 w-full">
            <div className="w-full py-6 md:py-8 px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
              {children}
            </div>
          </main>
          <Toaster />
          <footer className="py-6 bg-background border-t-2 border-border px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between w-full text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} SnapRecipe. All rights reserved.</p>
              <p>
                Built with 💝 by{' '}
                <a 
                  href="https://nagaprasad-ts.github.io/portfolio/" 
                  className='font-semibold text-accent hover:underline'
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nagaprasad T S
                </a>
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
