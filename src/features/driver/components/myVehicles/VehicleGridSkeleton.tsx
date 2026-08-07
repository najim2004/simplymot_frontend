import { Skeleton } from "@/components/ui/skeleton";

interface VehicleGridSkeletonProps {
  count?: number;
}

export default function VehicleGridSkeleton({ count = 4 }: VehicleGridSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="bg-[#F8FAFB] rounded-lg p-6 border border-[#B8EFBF]"
        >
          {/* Skeleton Image */}
          <div className="flex justify-center mb-4">
            <Skeleton className="w-[100px] h-[100px] rounded-lg" />
          </div>
          {/* Skeleton Registration Number */}
          <div className="text-center mb-4">
            <Skeleton className="h-6 w-24 mx-auto rounded" />
          </div>
        </div>
      ))}
    </>
  );
}
