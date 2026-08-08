"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { DEFAULT_GARAGE_AVATAR_SRC } from "@/lib/garage-assets";
import { useGetGarageServicesQuery, BookingModal } from "@/features/driver";

function DetailsSkeleton() {
  return (
    <div className="w-full mx-auto animate-pulse">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column Skeleton */}
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
            {/* Back button skeleton */}
            <div className="h-8 w-32 bg-gray-200 rounded-sm"></div>

            {/* Garage Info Header Card Skeleton */}
            <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#D2D2D5] space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-lg shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-7 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Pricing Section Skeleton */}
            <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#D2D2D5] space-y-3">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Additional Services Skeleton */}
            <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#D2D2D5] space-y-2">
              <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton (Map) */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
            <div className="h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const garageId = searchParams.get("id");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const {
    data: garageData,
    isLoading,
    error,
  } = useGetGarageServicesQuery(garageId || "", { skip: !garageId });

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  const garageDetails = garageData?.data;

  if (error || !garageDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <div className="text-lg text-red-600">Garage details not found</div>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column - Garage Details */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="self-start inline-flex h-8 items-center gap-1.5 rounded-sm border-[#19CA32] bg-transparent hover:bg-transparent px-3 py-1 text-[13px] font-medium shadow-none transition-all duration-150 ease-out touch-manipulation select-none active:text-[#16b82e] active:border-[#16b82e] active:shadow-inner focus-visible:ring-[#19CA32]"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Back to Results
            </Button>

            <div className="space-y-4 bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
              {/* Garage Title and Avatar */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-full sm:w-32 h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={
                      garageDetails.garage_image?.trim()
                        ? garageDetails.garage_image
                        : DEFAULT_GARAGE_AVATAR_SRC
                    }
                    alt={garageDetails.garage_name}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    {garageDetails.garage_name}
                  </h1>
                  <div className="mt-2 sm:mt-3 space-y-1 text-sm sm:text-base text-gray-600">
                    <div>{garageDetails.address || "N/A"}</div>
                    <div>
                      <strong>Postcode :</strong>{" "}
                      {garageDetails.post_code || "N/A"}
                    </div>
                    <div>
                      <strong>Contact :</strong>{" "}
                      {garageDetails.phone_number || "N/A"}
                    </div>
                    <div>
                      <strong>Email :</strong>{" "}
                      {garageDetails.contact_email || "N/A"}
                    </div>
                    <div>
                      <strong>DVSA Approval Number :</strong>{" "}
                      {garageDetails.vts_number || "N/A"}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-gray-700">
                      <ShieldCheck className="h-4 w-4 text-[#19CA32]" />
                      <span>DVSA Approved MOT Centre</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Check className="h-4 w-4 text-[#19CA32]" />
                      <span>No hidden fees - Pay at the garage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MOT Fee and Retest Fee */}
            {Boolean(garageDetails.services?.mot_services?.length) && (
              <div className="space-y-3 bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                {[...(garageDetails.services?.mot_services || [])]
                  .sort((a, b) =>
                    (a.vehicle_class || "").localeCompare(
                      b.vehicle_class || "",
                    ),
                  )
                  .map((group) => (
                    <div
                      key={group.vehicle_class}
                      className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4"
                    >
                      <div className="mb-3">
                        <div className="text-base sm:text-lg font-bold text-gray-900">
                          {group.vehicle_class}
                        </div>
                        <p className="text-sm text-gray-600">
                          {group.vehicle_class === "Class 7"
                            ? "Large vans / commercial vehicles"
                            : "Cars & small vans (including larger family vehicles)"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {group.mot && (
                          <div>
                            <div className="text-sm font-bold text-gray-900 mb-1">
                              MOT Fee
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-[#19CA32]">
                              £{Number(group.mot.price).toFixed(2)}
                            </div>
                          </div>
                        )}
                        {group.mot_retest && (
                          <div>
                            <div className="text-sm font-bold text-gray-900 mb-1">
                              Retest Fee
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-[#19CA32]">
                              £{Number(group.mot_retest.price).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Additional Services */}
            {Boolean(garageDetails.services?.other_services?.length) && (
              <div className="bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 border-b border-[#D2D2D5] pb-2">
                  Additional services
                </h3>
                <div className="space-y-0">
                  {garageDetails.services?.other_services?.map(
                    (additional, index) => (
                      <div key={additional.id} className="relative">
                        {index > 0 && (
                          <div className="absolute top-0 left-0 right-0 border-t border-gray-200"></div>
                        )}
                        <div className="flex items-center text-gray-700 text-sm sm:text-base py-2 sm:py-3">
                          <div className="w-5 h-5 mr-3 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22.7 19.5l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l1.8-1.8c.5-.4.5-1.1.1-1.4z" />
                            </svg>
                          </div>
                          <span>{additional.title}</span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {Boolean(garageDetails.schedule?.schedule_intervals?.length) && (
              <div className="bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                  Opening Hours
                </h3>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">
                          Day
                        </th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">
                          Opening
                        </th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">
                          Closing
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {garageDetails.schedule?.schedule_intervals?.map(
                        (interval) => (
                          <tr
                            key={interval.id}
                            className="border-t border-gray-200"
                          >
                            <td className="py-2.5 px-4 font-medium text-gray-900 capitalize">
                              {interval.day_of_week.toLowerCase()}
                            </td>
                            {interval.is_closed ? (
                              <td
                                colSpan={2}
                                className="py-2.5 px-4 text-red-500 font-medium"
                              >
                                Closed
                              </td>
                            ) : (
                              <>
                                <td className="py-2.5 px-4 text-gray-600">
                                  {interval.open_time || "N/A"}
                                </td>
                                <td className="py-2.5 px-4 text-gray-600">
                                  {interval.close_time || "N/A"}
                                </td>
                              </>
                            )}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Map and Booking */}
        <div className="space-y-4 sm:space-y-6 xl:sticky xl:top-0 xl:self-start">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative">
              <div className="h-64 sm:h-80 lg:h-96 relative">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    (garageDetails.address || "") +
                      ", " +
                      (garageDetails.post_code || ""),
                  )}&output=embed&z=15`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  className="rounded-t-lg"
                  title={`Map showing location of ${garageDetails.garage_name}`}
                ></iframe>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full bg-[#19CA32] text-[#fff] shadow-none font-semibold py-4 sm:py-6 text-sm xl:text-base rounded-lg transition-all duration-150 ease-out touch-manipulation select-none hover:bg-[#16b82e] hover:shadow-sm active:scale-[0.97] active:duration-75 active:bg-[#128f24] active:shadow-inner cursor-pointer"
                >
                  Book My MOT
                </Button>

                {/* Payment Info */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                  <p className="text-gray-700 font-medium text-sm sm:text-base lg:text-lg leading-relaxed">
                    No upfront payment - pay at the garage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        garage={{ id: garageDetails.id }}
      />
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <DetailsContent />
    </Suspense>
  );
}
