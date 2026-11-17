"use client";

import { Suspense } from "react";
import { AdminRbacPage } from "@/features/admin/components/RbacManagement/AdminRbacPage";

export default function AuditLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-gray-500">
          Loading security logs...
        </div>
      }
    >
      <AdminRbacPage initialTab="audit" />
    </Suspense>
  );
}
