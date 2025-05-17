
"use client";

import { Suspense } from 'react';
import { LoginPage as LoginForm } from '@/components/login-form'; // Renamed LoginPage component to avoid conflict with function

export default function LoginPage() { // This is the page component
  return (
    // The outer div handles centering for this specific page, as it has a unique layout need.
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center w-full">
      <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
