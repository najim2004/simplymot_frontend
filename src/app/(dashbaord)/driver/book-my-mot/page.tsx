"use client";

import React, {
  useEffect,
  useState,
  useRef,
  Suspense,
  useMemo,
} from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

import imgMot from "@/public/Image/admin/cardMot.png";
import { GarageCard } from "@/features/driver";
import {
  useBookSlotMutation,
  useSearchVehiclesAndGaragesQuery,
  GarageSortBy,
  type GarageData,
} from "@/features/driver";
// Pagination restore: add ChevronLeft, ChevronRight to this import.
import { Check, ChevronDown, Loader, Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setPendingBooking } from "@/features/driver";
import {
  useAddVehicleMutation,
  useGetVehiclesQuery,
} from "@/features/driver";
import { BookingSuccessModal } from "@/features/driver";
import { useAuth } from "@/features/auth";
import LoadingSpinner from "@/components/reusable/LoadingSpinner";
import { getBrandLogo, normalizeRegistration } from "@/lib/helper/vehicle.helper";
import { cx } from "class-variance-authority";
import { consumeBookMyMotScrollPosition } from "@/lib/book-my-mot-navigation";
import { trackBookingConversionFromApiData } from "@/lib/tracking";

interface FormData {
  registrationNumber: string;
  postcode: string;
}

interface VehicleInfo {
  registration_number: string;
  make: string;
  model: string;
  color: string;
  fuel_type: string;
  mot_expiry_date: string;
  exists_in_account: boolean;
  vehicle_id: string;
}

/** API returns garages in distance order; price sorts reorder only this list client-side. */
function sortGaragesForDisplay(list: GarageData[], sort: GarageSortBy): GarageData[] {
  if (sort === GarageSortBy.DISTANCE || list.length <= 1) {
    return list;
  }
  const sorted = [...list];
  const num = (value: unknown) =>
    typeof value === "number" && !Number.isNaN(value) ? value : null;

  if (sort === GarageSortBy.PRICE_LOW_TO_HIGH) {
    sorted.sort((a, b) => {
      const pa = num(a.mot_price);
      const pb = num(b.mot_price);
      if (pa !== null || pb !== null) {
        if (pa === null) return 1;
        if (pb === null) return -1;
        if (pa !== pb) return pa - pb;
      }
      const da = num(a.distance_miles) ?? Number.POSITIVE_INFINITY;
      const db = num(b.distance_miles) ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
  } else if (sort === GarageSortBy.PRICE_HIGH_TO_LOW) {
    sorted.sort((a, b) => {
      const pa = num(a.mot_price);
      const pb = num(b.mot_price);
      if (pa !== null || pb !== null) {
        if (pa === null) return 1;
        if (pb === null) return -1;
        if (pa !== pb) return pb - pa;
      }
      const da = num(a.distance_miles) ?? Number.POSITIVE_INFINITY;
      const db = num(b.distance_miles) ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
  }
  return sorted;
}

function BookMyMOTContent() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const searchParamsFromURL = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // reset,
  } = useForm<FormData>();

  const { user } = useAuth();
  const shouldShowMotExpiry = Boolean(user?.id);

  // Get registration number and postcode from URL query parameters
  const registrationFromURL = searchParamsFromURL?.get("registration");
  const postcodeFromURL = searchParamsFromURL?.get("postcode");
  const isLoggedIn = searchParamsFromURL?.get("is_logged_in");

  const pendingBooking = useSelector(
    (rootState: RootState) => rootState.bookMyMot.pendingBooking,
  );

  const limit = 10;
  // Pagination restore: const [page, setPage] = useState(1);
  // Pagination restore: const [totalCount, setTotalCount] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isVehicleDetailsExpanded, setIsVehicleDetailsExpanded] =
    useState(false);

  // Local state for results (requested by user)
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [rawGarages, setRawGarages] = useState<GarageData[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isBookingInitiated = useRef(false);
  const pendingScrollRestore = useRef<number | null>(null);

  useEffect(() => {
    pendingScrollRestore.current = consumeBookMyMotScrollPosition();
  }, []);

  const [successDetails, setSuccessDetails] = useState<{
    garage_name: string;
    garage_address: string;
    date: string;
    start_time: string;
    end_time: string;
    order_id?: string;
    total_amount?: string | number;
  } | null>(null);

  const formatMotExpiryDate = (date: string) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    setIsVehicleDetailsExpanded(false);
  }, [vehicle?.vehicle_id]);

  // Derived state for auto-search flag
  const isSearchActive = !!(registrationFromURL && postcodeFromURL);

  // Auto-fill form with values from URL
  useEffect(() => {
    if (registrationFromURL) {
      setValue("registrationNumber", registrationFromURL);
    }
    if (postcodeFromURL) {
      setValue("postcode", postcodeFromURL);
    }
  }, [registrationFromURL, postcodeFromURL, setValue]);

  // Function to clear URL parameters
  // const clearURLParams = () => {
  //   router.replace("/driver/book-my-mot", { scroll: false });
  // };

  // Sort option from URL; API always fetches distance order (see sort_by below).
  const sortBy =
    (searchParamsFromURL?.get("sort_by") as GarageSortBy) ||
    GarageSortBy.DISTANCE;

  const displayGarages = useMemo(
    () => sortGaragesForDisplay(rawGarages, sortBy),
    [rawGarages, sortBy],
  );

  // Query will execute when URL params are present
  // Pagination restore: use `page` from state instead of literal `1` below.
  const { data, isLoading, error, refetch, isFetching } =
    useSearchVehiclesAndGaragesQuery(
      {
        registration_number: registrationFromURL || "",
        postcode: postcodeFromURL || "",
        page: 1,
        limit,
        sort_by: GarageSortBy.DISTANCE,
      },
      {
        skip: !isSearchActive,
      },
    );

  // Sync data to local state
  useEffect(() => {
    if (data) {
      setVehicle(data.data.vehicle || null);
      setRawGarages(data.data.garages || []);
      // Pagination restore: setTotalCount(data.meta_data.total_count ?? 0);

      if (isSearchActive && !isFetching) {
        const savedScroll = pendingScrollRestore.current;
        if (savedScroll !== null) {
          pendingScrollRestore.current = null;
          requestAnimationFrame(() => {
            window.scrollTo({ top: savedScroll, behavior: "auto" });
          });
        } else {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }
  }, [data, isFetching, isSearchActive]);

  // Handle errors
  useEffect(() => {
    if (error) {
      let errorMessage = "Failed to search data. Please try again.";
      if ("data" in error && (error.data as any)?.message) {
        const msg = (error.data as any).message;
        if (Array.isArray(msg)) {
          errorMessage = msg.join(", ");
        } else {
          errorMessage =
            typeof msg === "string" ? msg : msg.message || errorMessage;
        }
      }
      toast.error(errorMessage, { toastId: "search-api-error" });
    }
  }, [error]);

  const onSubmit = async (formData: FormData) => {
    /*
     * Pagination restore on duplicate submit:
     * if same params: page !== 1 ? setPage(1) : refetch();
     * else branch: before router.push → setPage(1);
     */
    // If the values are the same as current ones, force a refetch
    if (
      formData.registrationNumber === registrationFromURL &&
      formData.postcode === postcodeFromURL
    ) {
      refetch();
    } else {
      const params = new URLSearchParams(searchParamsFromURL?.toString());
      params.set(
        "registration",
        normalizeRegistration(formData.registrationNumber),
      );
      params.set("postcode", formData.postcode);

      // Using push to update the URL and trigger search reactively
      router.push(`/driver/book-my-mot?${params.toString()}`);
    }
  };

  const showResults = vehicle !== null || rawGarages.length > 0;
  const { data: vehicles, isFetching: isFetchingVehicles } =
    useGetVehiclesQuery(null, { skip: !user?.id });
  const [addVehicle, { isLoading: isAddingVehicle }] = useAddVehicleMutation();
  const [bookSlot, { isLoading: isBooking }] = useBookSlotMutation();

  useEffect(() => {
    const performAutoBooking = async () => {
      // Guard: Ensure everything is ready and we haven't already tried
      if (
        isLoggedIn !== "true" ||
        !user?.id ||
        !pendingBooking.vehicle_registration_number ||
        isFetchingVehicles ||
        isAddingVehicle ||
        isBooking ||
        isBookingInitiated.current
      ) {
        return;
      }

      // Check for expiration
      if (
        !pendingBooking.expires_at ||
        Date.now() > new Date(pendingBooking.expires_at).getTime()
      ) {
        // Expired, clear state and params
        cleanupBookingState();
        return;
      }

      // Mark as initiated to prevent double-runs
      isBookingInitiated.current = true;

      try {
        let vehicleId = "";
        const existVehicle = vehicles?.data?.find(
          (vehicle) =>
            vehicle.registration_number ===
            pendingBooking.vehicle_registration_number,
        );

        if (existVehicle) {
          vehicleId = existVehicle.id;
        } else {
          const response = await addVehicle({
            registration_number: pendingBooking.vehicle_registration_number,
          }).unwrap();
          if (!response.success || !response?.data?.id)
            throw new Error(response.message || "Failed to add vehicle");
          vehicleId = response.data.id;
        }

        const result = await bookSlot({
          vehicle_id: vehicleId,
          ...(pendingBooking.slot_id
            ? { slot_id: pendingBooking.slot_id }
            : {
                date: pendingBooking.date,
                start_time: pendingBooking.start_time,
                end_time: pendingBooking.end_time,
              }),
          garage_id: pendingBooking.garage_id,
          service_type: pendingBooking.service_type,
        }).unwrap();

        if (result.success) {
          let successMessage = "Slot booked successfully!";
          if (typeof result.message === "string") {
            successMessage = result.message;
          } else if (
            result.message &&
            typeof result.message === "object" &&
            "message" in result.message
          ) {
            const msgObj = result.message as { message?: string };
            if (typeof msgObj.message === "string") {
              successMessage = msgObj.message;
            }
          }
          toast.success(successMessage);
          trackBookingConversionFromApiData(result.data);

          // Capture details into local state BEFORE cleanup
          const bookingData = result.data as Record<string, unknown> | undefined;
          setSuccessDetails({
            garage_name: pendingBooking.garage_name || "",
            garage_address: pendingBooking.garage_address || "",
            date: String(bookingData?.date ?? pendingBooking.date ?? ""),
            start_time: String(
              bookingData?.start_time ?? pendingBooking.start_time ?? "",
            ),
            end_time: String(
              bookingData?.end_time ?? pendingBooking.end_time ?? "",
            ),
            order_id: bookingData?.order_id
              ? String(bookingData.order_id)
              : undefined,
            total_amount: bookingData?.total_amount as
              | string
              | number
              | undefined,
          });

          setIsSuccessModalOpen(true);
        } else {
          let errorMessage = "Failed to book slot";
          if (typeof result.message === "string") {
            errorMessage = result.message;
          } else if (
            result.message &&
            typeof result.message === "object" &&
            "message" in result.message
          ) {
            const msgObj = result.message as { message?: string };
            if (typeof msgObj.message === "string") {
              errorMessage = msgObj.message;
            }
          }
          toast.error(errorMessage);
        }
      } catch (error: any) {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to book slot. Please try again.";
        toast.error(errorMessage);
      } finally {
        // ALWAYS cleanup after an attempt
        cleanupBookingState();
      }
    };

    const cleanupBookingState = () => {
      // Clear Redux state
      dispatch(
        setPendingBooking({
          slot_id: "",
          garage_id: "",
          vehicle_registration_number: "",
          start_time: "",
          end_time: "",
          date: "",
          service_type: "MOT",
          expires_at: "",
          garage_name: "",
          garage_address: "",
        }),
      );

      // Clear URL params
      const params = new URLSearchParams(searchParamsFromURL?.toString());
      params.delete("is_logged_in");
      router.replace(
        `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
        {
          scroll: false,
        },
      );
    };

    performAutoBooking();
  }, [
    isLoggedIn,
    pendingBooking,
    user,
    vehicles,
    isFetchingVehicles,
    isAddingVehicle,
    isBooking,
    dispatch,
    router,
    addVehicle,
    bookSlot,
    pathname,
    searchParamsFromURL,
  ]);

  return (
    <div className="w-full mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="overflow-hidden">
        <div
          className={`relative ${showResults ? "h-auto" : "h-[calc(100vh-100px)] overflow-hidden"}`}
        >
          <div
            className={`relative z-10 w-full max-w-4xl xl:max-w-5xl mx-auto  ${showResults ? "pt-0" : "pt-16 lg:pt-20"}`}
          >
            {showResults ? (
              <></>
            ) : (
              <h1 className="text-[30px] sm:text-[36px] lg:text-[46px] font-semibold text-[#19CA32] leading-[1.15] font-inder text-center">
                Find MOT garages near you in seconds
              </h1>
            )}

            <div
              className={`items-end justify-center lg:grid-cols-3 gap-2 md:gap-4 w-full ${showResults ? "mt-0 flex lg:grid" : "grid mt-6 sm:mt-8 lg:mt-10"}`}
            >
              {/* Registration Number */}
              <div>
                <Label
                  htmlFor="registrationNumber"
                  className="text-sm mb-2 font-medium text-gray-700 lg:block sr-only"
                >
                  Registration Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registrationNumber"
                  type="text"
                  placeholder="Registration Number"
                  className="h-11 bg-white text-base border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] rounded-sm"
                  {...register("registrationNumber", {
                    required: "Registration number is required",
                    pattern: {
                      value: /^[A-Z0-9\s]{2,9}$/i,
                      message: "Invalid registration number format",
                    },
                  })}
                />
                <div className="min-h-4">
                  {errors.registrationNumber && (
                    <p className="text-red-500 text-xs">
                      {errors.registrationNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Postcode */}
              <div>
                <Label
                  htmlFor="postcode"
                  className="text-sm mb-2 font-medium text-gray-700 lg:block sr-only"
                >
                  Postcode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postcode"
                  type="text"
                  placeholder="Postcode"
                  className="h-11 bg-white text-base border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] rounded-sm"
                  {...register("postcode", {
                    required: "Postcode is required",
                  })}
                />
                <div className="min-h-4">
                  {errors.postcode && (
                    <p className="text-red-500 text-xs">
                      {errors.postcode.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Find Garage Button */}
              <div className="sm:col-span-2 lg:col-span-1 lg:pt-7">
                <Button
                  type="submit"
                  disabled={isLoading || isFetching}
                  className="w-full h-11 bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium text-sm xl:text-base rounded-sm transition-all duration-200 hover:shadow-lg cursor-pointer disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed"
                >
                  {isLoading || isFetching ? (
                    <>
                      <p className="lg:block hidden">Searching...</p>
                      <Loader className="w-4 h-4 animate-spin text-white" />
                    </>
                  ) : (
                    <>
                      <span className={showResults ? "hidden lg:block" : ""}>
                        Find Garage
                      </span>{" "}
                      <Search className="size-4 text-white" />
                    </>
                  )}
                </Button>
                <div className="min-h-4"></div>
              </div>
            </div>

            {!showResults && (
              <p className="flex items-center justify-center lg:justify-start gap-2 text-sm sm:text-base text-gray-700">
                <Check className="h-5 w-5 shrink-0 text-[#19CA32]" />
                <span>No upfront payment - pay at the garage</span>
              </p>
            )}

            {vehicle && (
              <div
                className={cx(
                  "mx-auto w-full max-w-[620px] rounded-md transition-all duration-200",
                  isVehicleDetailsExpanded
                    ? "bg-[#f4f8f5] border border-[#dce9df]"
                    : "bg-transparent border border-transparent hover:bg-[#f4f8f5] hover:border-[#dce9df]",
                )}
              >
                <button
                  type="button"
                  onClick={() => setIsVehicleDetailsExpanded((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Image
                      src={getBrandLogo(vehicle.make)}
                      alt={`${vehicle.make} logo`}
                      width={34}
                      height={34}
                      className="rounded-full border border-[#dce9df] bg-white p-1 object-contain"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#202020]">
                        {vehicle.make || "Vehicle"}
                      </p>
                      <p className="truncate text-xs text-[#5d5d5d]">
                        {vehicle.registration_number}
                        {shouldShowMotExpiry && (
                          <>
                            <span className="mx-1 text-[#b8b8b8]">•</span>
                            MOT: {formatMotExpiryDate(vehicle.mot_expiry_date)}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cx(
                      "h-4 w-4 text-[#1c1c1c] transition-transform duration-200",
                      isVehicleDetailsExpanded && "rotate-180",
                    )}
                  />
                </button>

                <div
                  className={cx(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isVehicleDetailsExpanded
                      ? "max-h-[280px] opacity-100 border-t border-[#e7ece8] px-3 py-2.5"
                      : "max-h-0 opacity-0 px-3 py-0",
                  )}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                    <div className="rounded-md bg-white px-2.5 py-2">
                      <p className="text-[#7a7a7a]">Model</p>
                      <p className="mt-0.5 font-medium text-[#202020]">
                        {vehicle.model || "Unknown"}
                      </p>
                    </div>
                    <div className="rounded-md bg-white px-2.5 py-2">
                      <p className="text-[#7a7a7a]">Color</p>
                      <p className="mt-0.5 font-medium text-[#202020]">
                        {vehicle.color}
                      </p>
                    </div>
                    <div className="rounded-md bg-white px-2.5 py-2 col-span-2 sm:col-span-1">
                      <p className="text-[#7a7a7a]">Fuel</p>
                      <p className="mt-0.5 font-medium text-[#202020]">
                        {vehicle.fuel_type}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`absolute bottom-0 right-1/2 translate-x-1/2 md:right-0 md:translate-x-0 z-0 mt-4 flex justify-center md:justify-end lg:absolute lg:bottom-0 lg:right-8 lg:mt-0 w-[60%] md:w-[50%] lg:w-[60%] xl:w-[40%] ${showResults ? "hidden" : "block"}`}
          >
            <Image
              src={imgMot}
              alt="MOT garage illustration"
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>
      </form>

      {showResults && vehicle === null && (
        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mb-4">
          <div className="text-center py-6">
            <div className="text-red-500 text-lg font-medium mb-2">
              Vehicle Not Found
            </div>
            <p className="text-gray-600">
              No vehicle found with the registration number you provided. Please
              check and try again.
            </p>
          </div>
        </div>
      )}

      {/* Search Results Section */}
      {showResults && (
        <div ref={resultsRef} className="relative w-full mx-auto">
          {/* Garages Results */}
          {displayGarages.length > 0 ? (
            <div className="mt-2">
              {/* Payment Message */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex flex-col lg:flex-row justify-between items-start md:items-center gap-3">
                <p className="flex items-center gap-2 text-gray-700 text-sm xl:text-base font-medium">
                  <Check className="h-5 w-5 shrink-0 text-[#19CA32]" />
                  <span>No upfront payment - pay at the garage.</span>
                </p>

                {/* Sorting Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Sort by:
                  </span>
                  <select
                    value={
                      searchParamsFromURL?.get("sort_by") ||
                      GarageSortBy.DISTANCE
                    }
                    onChange={(e) => {
                      const newSortBy = e.target.value;
                      const params = new URLSearchParams(
                        searchParamsFromURL?.toString(),
                      );

                      // Update sort param
                      params.set("sort_by", newSortBy);
                      // Pagination restore: setPage(1); params.delete("page");

                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="border border-gray-300 rounded-md text-sm h-9 px-3 focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:border-transparent bg-white cursor-pointer"
                  >
                    <option value={GarageSortBy.DISTANCE}>Distance</option>
                    <option value={GarageSortBy.PRICE_LOW_TO_HIGH}>
                      Price: Low to High
                    </option>
                    <option value={GarageSortBy.PRICE_HIGH_TO_LOW}>
                      Price: High to Low
                    </option>
                  </select>
                </div>
              </div>

              {/* Garage List */}
              <GarageCard foundGarages={displayGarages} vehicle={vehicle} />

              {/*
                === Pagination (previous implementation — uncomment to restore) ===
                Pre-requisites: import ChevronLeft, ChevronRight from "lucide-react";
                  useState page + totalCount; setTotalCount in data effect from meta_data.total_count;
                  query param `page` from state; onSubmit sort-dropdown notes above.

              {Math.ceil(totalCount / limit) > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="cursor-pointer border-gray-300 hover:bg-gray-50 hover:text-[#19CA32] px-3 h-10"
                  >
                    <ChevronLeft />
                  </Button>

                  <div className="flex items-center gap-1 sm:gap-2">
                    {(() => {
                      const totalPages = Math.ceil(totalCount / limit);
                      const pages: (number | string)[] = [];

                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (page <= 4) {
                          for (let i = 1; i <= 5; i++) pages.push(i);
                          pages.push("...");
                          pages.push(totalPages);
                        } else if (page >= totalPages - 3) {
                          pages.push(1);
                          pages.push("...");
                          for (let i = totalPages - 4; i <= totalPages; i++)
                            pages.push(i);
                        } else {
                          pages.push(1);
                          pages.push("...");
                          pages.push(page - 1);
                          pages.push(page);
                          pages.push(page + 1);
                          pages.push("...");
                          pages.push(totalPages);
                        }
                      }

                      return pages.map((p, index) => (
                        <React.Fragment key={index}>
                          {p === "..." ? (
                            <span className="px-2 text-gray-500">...</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                typeof p === "number" && setPage(p)
                              }
                              className={`
                                        min-w-[40px] h-10 flex items-center justify-center rounded-md font-medium transition-colors duration-200
                                        ${
                                          page === p
                                            ? "bg-[#19CA32] text-white shadow-md"
                                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#19CA32]"
                                        }
                                    `}
                            >
                              {p}
                            </button>
                          )}
                        </React.Fragment>
                      ));
                    })()}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.ceil(totalCount / limit), p + 1),
                      )
                    }
                    disabled={page >= Math.ceil(totalCount / limit)}
                    className="cursor-pointer border-gray-300 hover:bg-gray-50 hover:text-[#19CA32] px-3 h-10"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              )}
              */}
            </div>
          ) : vehicle && rawGarages.length === 0 ? (
            <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mt-8">
              <div className="text-center py-6">
                <div className="text-red-500 text-lg font-medium mb-2">
                  Garage Not Found
                </div>
                <p className="text-gray-600">
                  No garage found with the postcode you provided. Please check
                  and try again.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        submittedBooking={null}
        selectedSlot={
          successDetails?.start_time && successDetails?.end_time
            ? ({
                slot_id: "",
                garage_id: "",
                vehicle_id: "",
                date: successDetails.date,
                start_time: successDetails.start_time,
                end_time: successDetails.end_time,
                order_id: successDetails.order_id,
              } as any)
            : null
        }
        totalAmount={successDetails?.total_amount}
        selectedDate={
          successDetails?.date ? new Date(successDetails.date) : undefined
        }
        garage={
          successDetails?.garage_name
            ? ({
                garage_name: successDetails.garage_name,
                address: successDetails.garage_address,
              } as any)
            : null
        }
        formatTime={(time: string) => {
          if (!time) return "";
          const [hours, minutes] = time.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        }}
      />

      {/* Auto-booking Loading Overlay */}
      {isLoggedIn === "true" &&
        (isAddingVehicle || isBooking || isFetchingVehicles) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-9999 flex flex-col items-center justify-center">
            <div className="bg-white p-10 rounded-3xl shadow-2xl scale-110">
              <LoadingSpinner
                size="lg"
                text="Finalizing Your Booking..."
                fullScreen={false}
              />
            </div>
          </div>
        )}
    </div>
  );
}

export default function BookMyMOT() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." fullScreen={false} />
        </div>
      }
    >
      <BookMyMOTContent />
    </Suspense>
  );
}
