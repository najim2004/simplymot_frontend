import Image from "next/image";
import React from "react";
import { DEFAULT_GARAGE_AVATAR_SRC } from "@/lib/garage-assets";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  Tag,
  CheckCircle2,
} from "lucide-react";

interface GarageProfileCardProps {
  garageName?: string;
  address?: string;
  postcode?: string;
  contact?: string;
  phoneNumber?: string;
  email?: string;
  vtsNumber?: string;
  price?: string;
  avatarUrl?: string | null;
  onBookMOT?: () => void;
}

export default function GarageProfileCard({
  garageName = "QuickFix Auto",
  address = "123 High Street",
  postcode = "SW1A 1AA",
  contact = "John Doe",
  phoneNumber = "+44 20 7946 0912",
  email = "info@quickfixauto.co.uk",
  vtsNumber = "VTS-123456",
  price = "45.00",
  avatarUrl = null,
}: GarageProfileCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  const isValidUrl =
    avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim().length > 0;

  React.useEffect(() => {
    if (isValidUrl) {
      setImageError(false);
      setImageLoading(true);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [isValidUrl]);

  const displayAvatar =
    isValidUrl && !imageError ? avatarUrl.trim() : DEFAULT_GARAGE_AVATAR_SRC;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Decorative Top Accent Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 h-28 sm:h-36 w-full relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute left-1/3 -top-8 w-36 h-36 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
        
        {/* MOT Fee Badge */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-white/40 flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-semibold text-gray-500 tracking-wider">MOT Fee</p>
            <p className="text-base font-bold text-gray-900 leading-none">£{price}</p>
          </div>
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white ring-4 ring-white shadow-lg overflow-hidden p-1 flex items-center justify-center border border-gray-100">
              {imageLoading && isValidUrl && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                </div>
              )}
              <Image
                width={112}
                height={112}
                src={displayAvatar}
                alt={garageName}
                className={`w-full h-full object-contain rounded-xl ${
                  imageLoading && isValidUrl && !imageError
                    ? "opacity-0"
                    : "opacity-100"
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200/60 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Authorized MOT Testing Center</span>
          </div>
        </div>

        {/* Garage Title & Primary Contact */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{garageName}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Primary Contact: <span className="font-medium text-gray-700">{contact}</span>
          </p>
        </div>

        {/* Info Grid Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Address */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 font-medium">Address & Postcode</p>
              <p className="text-xs font-semibold text-gray-900 truncate">{address}</p>
              <p className="text-[11px] font-mono text-emerald-700 font-medium">{postcode}</p>
            </div>
          </div>

          {/* Contact Phone */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="p-1.5 rounded-lg bg-blue-100/80 text-blue-700 shrink-0 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 font-medium">Phone Number</p>
              <p className="text-xs font-semibold text-gray-900 truncate">{phoneNumber || contact}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="p-1.5 rounded-lg bg-purple-100/80 text-purple-700 shrink-0 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 font-medium">Email Address</p>
              <p className="text-xs font-semibold text-gray-900 truncate">{email}</p>
            </div>
          </div>

          {/* VTS Number */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="p-1.5 rounded-lg bg-amber-100/80 text-amber-700 shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 font-medium">VTS Number</p>
              <p className="text-xs font-semibold font-mono text-gray-900 truncate">{vtsNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
