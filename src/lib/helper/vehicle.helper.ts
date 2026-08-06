import carLogos from "@/public/data/car-logos.json";

/**
 * Normalizes a string by converting to lowercase and removing all non-alphanumeric characters.
 */
const normalize = (str: string): string => {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
};

/**
 * Get brand logo URL based on vehicle make
 * @param make - Vehicle make (e.g., "FORD", "MERCEDES-BENZ", "BMW")
 * @returns Logo URL or default placeholder
 */
export const getBrandLogo = (make: string): string => {
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
 * @param registration - Raw registration number
 * @returns Normalized registration string
 */
export const normalizeRegistration = (registration: string): string => {
  if (!registration) return "";
  return registration.replace(/\s+/g, "").toUpperCase();
};
