import React, { Suspense } from "react";
import { ForgotPassword } from "@/features/auth";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#19CA32]" />
        </div>
      }
    >
      <ForgotPassword />
    </Suspense>
  );
}

