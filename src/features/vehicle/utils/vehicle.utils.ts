import carLogos from "@/public/data/car-logos.json";

/**
 * Normalizes a string by converting to lowercase and removing all non-alphanumeric characters.
 */
export const normalize = (str: string): string => {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
};

/**
 * Get brand logo URL based on vehicle make
 * @param make - Vehicle make (e.g., "FORD", "MERCEDES-BENZ", "BMW")
 * @returns Logo URL or default placeholder
 */
export const getBrandLogo = (make?: string | null): string => {
  if (!make) return "/Image/car-logos/ford.png";

  const lowerMake = make.toLowerCase().trim();
  const normalizedMake = normalize(make);

  // 1. Try exact match (lowercase/trimmed)
  let logoEntry = carLogos.find((logo) => logo.name === lowerMake);
  if (logoEntry) return logoEntry.path;

  // 2. Try normalized match (remove all special characters/spaces)
  logoEntry = carLogos.find((logo) => normalize(logo.name) === normalizedMake);
  if (logoEntry) return logoEntry.path;

  // 3. Try partial match - if the normalized input contains a known brand name (or vice versa)
  logoEntry = carLogos.find((logo) => {
    const logoNorm = normalize(logo.name);
    return (
      logoNorm.length > 2 &&
      (normalizedMake.includes(logoNorm) || logoNorm.includes(normalizedMake))
    );
  });

  // Return path if found, otherwise return a default placeholder (Ford as fallback)
  return logoEntry ? logoEntry.path : "/Image/car-logos/ford.png";
};

/**
 * Normalizes vehicle registration number
 * Removes all spaces and converts to uppercase
 * Example: "EA15 YOC" -> "EA15YOC", "ea15 yoc" -> "EA15YOC"
 */
export const normalizeRegistration = (registration?: string | null): string => {
  if (!registration) return "";
  return registration.replace(/\s+/g, "").toUpperCase();
};

/**
 * Formats date string into GB format: 01 Jan 2026
 */
export const formatVehicleDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

/**
 * Returns UI style classes for MOT Pass/Fail status
 */
export const getStatusStyles = (status?: string | null) => {
  const isPass = status?.toLowerCase() === "pass";
  return {
    badge: isPass ? "bg-green-500 text-white" : "bg-red-500 text-white",
    passDate: isPass ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-300",
    expiryDate: !isPass ? "bg-red-50 border-red-300" : "bg-gray-50 border-gray-300",
  };
};

/**
 * Checks if a vehicle image URL is valid and non-empty
 */
export const isValidVehicleImageUrl = (url?: string | null): boolean => {
  if (!url || url.includes("example") || url.trim() === "") return false;
  return true;
};

/**
 * Checks if vehicle MOT is expired based on date
 */
export const isVehicleMotExpired = (expiryDate?: string | null): boolean => {
  if (!expiryDate) return false;
  try {
    return new Date(expiryDate).getTime() < Date.now();
  } catch {
    return false;
  }
};
