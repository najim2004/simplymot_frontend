"use client";

import React, { Suspense } from "react";
import VerifyEmailForm from "@/features/auth/components/VerifyEmailForm";
import LoadingSpinner from "@/components/reusable/LoadingSpinner";

function VerifyEmailContent() {
  return <VerifyEmailForm />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
