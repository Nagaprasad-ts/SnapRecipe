
"use client";

import { Suspense } from 'react';
import { SignupForm } from '@/components/signup-form';

export default function SignupPage() {
  return (
    // The outer div handles centering for this specific page
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center w-full">
      <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
