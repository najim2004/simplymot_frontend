"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DriverBookingRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/driver/my-bookings/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#19CA32] border-t-transparent" />
    </div>
  );
}
