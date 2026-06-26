"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AuthLoginForm from "../../_components/AuthLoginForm";

function DriverSignInForm() {
  return <AuthLoginForm userKind="DRIVER" />;
}

export default function DriverSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#19CA32]" />
        </div>
      }
    >
      <DriverSignInForm />
    </Suspense>
  );
}

