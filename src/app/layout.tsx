
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SnapRecipeLogo } from '@/components/snap-recipe-logo';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { AuthButton } from '@/components/auth-button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
  manifest: '/manifest.json', // Link to the manifest file
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="SnapRecipe" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SnapRecipe" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" /> 
        <meta name="msapplication-TileColor" content="#2563EB" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#2563EB" />

        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        
        {/* Splash screens for iOS - you'll need to create these images */}
        {/* 
        <link rel="apple-touch-startup-image" href="/images/splash/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/images/splash/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/images/splash/iphoneplus_splash.png" media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/images/splash/iphonex_splash.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/images/splash/iphonexr_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/images/splash/iphonexsmax_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/images/splash/ipad_splash.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/images/splash/ipadpro1_splash.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/images/splash/ipadpro3_splash.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/images/splash/ipadpro2_splash.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" /> 
        */}
      </head>
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
