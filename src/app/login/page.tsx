"use client";

import { Suspense } from 'react';
import { LoginPage } from '@/components/login-form';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
