import Image from "next/image";
import React from "react";
import { DEFAULT_GARAGE_AVATAR_SRC } from "@/lib/garage-assets";

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

interface GarageDetailsProps {
  address: string;
  postcode: string;
  contact: string;
  phoneNumber: string;
  email: string;
  vtsNumber: string;
}

interface GarageImageProps {
  className?: string;
  imageUrl?: string | null;
}

// Reusable Components
const GarageImage: React.FC<GarageImageProps> = ({ className, imageUrl }) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  // Validate and normalize image URL
  const isValidUrl =
    imageUrl && typeof imageUrl === "string" && imageUrl.trim().length > 0;

  React.useEffect(() => {
    if (isValidUrl) {
      setImageError(false);
      setImageLoading(true);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [isValidUrl]);

  if (isValidUrl && !imageError) {
    return (
      <div
        className={`rounded-lg flex items-center justify-center bg-gray-50 max-w-md mx-auto overflow-hidden ${className} relative`}
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        )}
        <Image
          width={500}
          height={500}
          src={imageUrl.trim()}
          alt="Garage avatar"
          className={`w-full h-auto object-contain mx-auto ${
            imageLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden border border-gray-200 ${className}`}
    >
      <Image
        width={160}
        height={160}
        src={DEFAULT_GARAGE_AVATAR_SRC}
        alt="Default garage logo"
        className="w-full h-auto object-contain mx-auto"
      />
    </div>
  );
};

const GarageDetails: React.FC<GarageDetailsProps> = ({
  address,
  postcode,
  contact,
  //   phoneNumber,
  email,
  vtsNumber,
}) => {
  const details = [
    { label: "Address", value: address },
    { label: "Postcode", value: postcode },
    { label: "Contact", value: contact },
    // { label: 'Phone', value: phoneNumber },
    { label: "Email", value: email },
    { label: "VTS Number", value: vtsNumber },
  ];

  return (
    <div className="space-y-2 text-sm text-gray-600">
      {details.map((detail, index) => (
        <div key={index}>
          <span className="font-medium">{detail.label} :</span> {detail.value}
        </div>
      ))}
    </div>
  );
};

const PriceDisplay: React.FC<{ price: string; className?: string }> = ({
  price,
  className,
}) => <div className={`font-bold text-green-500 ${className}`}>£ {price}</div>;

export default function GarageProfileCard({
  garageName = "QuickFix Auto - London",
  address = "xxxxxxxxxxx",
  postcode = "xxxxxxxxxxx",
  contact = "xxxxxxxxxxx",
  phoneNumber = "xxxxxxxxxxx",
  email = "xxxxxxxxxxx",
  vtsNumber = "xxxxxxxxxxx",
  price = "00.00",
  avatarUrl = null,
  onBookMOT,
}: GarageProfileCardProps) {
  const garageDetailsProps = {
    address,
    postcode,
    contact,
    phoneNumber,
    email,
    vtsNumber,
  };
  const actionButtonsProps = { onBookMOT };

  return (
    <div className="bg-white rounded-lg  border border-gray-200 w-full">
      {/* Mobile Layout */}
      <div className="flex flex-col sm:hidden gap-4 p-4">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
            {garageName}
          </h2>
          <PriceDisplay price={price} className="text-xl" />
        </div>

        <GarageImage
          className="w-full h-45"
          imageUrl={avatarUrl || undefined}
        />
        <GarageDetails {...garageDetailsProps} />
      </div>

      {/* Tablet Layout */}
      <div className="hidden sm:flex lg:hidden gap-5 p-5 min-h-[200px]">
        <div className="shrink-0">
          <GarageImage
            className="w-40 h-full"
            imageUrl={avatarUrl || undefined}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {garageName}
          </h2>
          <GarageDetails {...garageDetailsProps} />
        </div>

        <div className="flex flex-col justify-between items-end min-w-[160px]">
          <PriceDisplay price={price} className="text-2xl mt-4" />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-6 p-6 min-h-[200px]">
        <div className="shrink-0 relative cursor-pointer">
          <GarageImage
            className="w-40 h-full"
            imageUrl={avatarUrl || undefined}
          />
          {!avatarUrl && (
            <h1 className="text-center text-gray-500 text-sm absolute bottom-8 font-semibold left-1/2 -translate-x-1/2 -translate-y-1/2">
              Preview
            </h1>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {garageName}
          </h2>
          <GarageDetails {...garageDetailsProps} />
        </div>

        <div className="flex flex-col justify-between items-end min-w-[160px]">
          {/* <ActionButtons {...actionButtonsProps} className="w-full" buttonSize="md" /> */}
          <PriceDisplay price={price} className="text-2xl" />
        </div>
      </div>
    </div>
  );
}
