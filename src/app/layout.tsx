
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SnapRecipeLogo } from '@/components/snap-recipe-logo';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { AuthButton } from '@/components/auth-button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <header className="px-12 sticky top-0 z-50 w-full border-b-2 border-border bg-background/55 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block hidden">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
              <SnapRecipeLogo />
              <AuthButton />
            </div>
          </header>
          <header className="px-5 sticky top-0 z-50 w-full border-b-2 border-border/40 bg-background/55 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden block">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
              <SnapRecipeLogo />

              {/* Mobile Menu Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>

                <SheetContent side="left" className="w-64 p-4">
                  <div className="flex flex-col gap-4">
                    <AuthButton />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </header>
          <main className="flex-1 justify-center items-center">
            {children}
          </main>
          <Toaster />
          <footer className="py-6 md:px-8 md:py-0 bg-background border-t-2 border-border">
            <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
              <p className="text-balance text-center text-sm md:text-md leading-loose text-muted-foreground md:text-left">
                Built by 💝{' '}
                <a href="https://nagaprasad-ts.github.io/portfolio/" className='font-semibold text-accent hover:underline'>Nagaprasad T S</a>
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
