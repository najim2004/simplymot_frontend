"use client";

import { Suspense } from "react";
import { AdminRbacPage } from "@/features/admin/components/RbacManagement/AdminRbacPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-gray-500">
          Loading RBAC console...
        </div>
      }
    >
      <AdminRbacPage />
    </Suspense>
  );
}
