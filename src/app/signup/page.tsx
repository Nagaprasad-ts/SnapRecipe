"use client";

import { Suspense } from 'react';
import { SignupForm } from '@/components/signup-form';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
