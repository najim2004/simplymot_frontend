"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AuthLoginForm from "../../_components/AuthLoginForm";

function GarageLoginContent() {
  return <AuthLoginForm userKind="GARAGE" />;
}

export default function GarageLogin() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#19CA32]" />
        </div>
      }
    >
      <GarageLoginContent />
    </Suspense>
  );
}
