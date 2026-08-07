"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import bgImage from "@/public/Image/register/bgImage.png";
import carImage from "@/public/Image/register/registerLargeImg.png";

interface DriverAuthBannerProps {
  onBack?: () => void;
}

const driverHighlights = [
  { id: 1, title: "Book your MOT in just a few taps" },
  { id: 2, title: "Reschedule or cancel your bookings" },
  { id: 3, title: "Get automatic MOT reminders" },
  { id: 4, title: "Keep track of past MOTs" },
  { id: 5, title: "Stay road-legal with zero stress" },
];

export function DriverAuthBanner({ onBack }: DriverAuthBannerProps) {
  return (
    <div
      className="flex-1 lg:flex-1 text-white relative overflow-hidden rounded-2xl h-auto min-h-[80vh] lg:h-[calc(100vh-32px)]"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Absolute Image Parent Container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none flex items-end justify-end z-0">
        <Image
          src={carImage}
          alt="Car Illustration"
          className="w-full max-w-[500px] h-auto object-contain"
          priority
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 p-6 lg:p-12 flex flex-col justify-between h-full">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex justify-start cursor-pointer border border-white rounded-full p-2 w-fit group mb-4"
            >
              <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center group-hover:scale-150 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 text-white shrink-0" />
              </div>
            </button>
          )}

          <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center">
            <Link href="/">simplymot.co.uk</Link>
          </div>

          <div className="mt-8 space-y-4 md:mt-20">
            <h1 className="text-xl md:text-2xl font-bold font-arial-rounded leading-tight text-white">
              All Your MOT Needs In One Place.
            </h1>

            <div className="space-y-3">
              {driverHighlights.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3  text-white"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-sm md:text-lg font-medium">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverAuthBanner;
