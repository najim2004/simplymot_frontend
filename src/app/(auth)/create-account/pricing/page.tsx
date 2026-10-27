"use client";
import React, { useState } from "react";
import bgImage from "@/public/Image/register/bgImage.png";
import carImage from "@/public/Image/register/registerLargeImg.png";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  ShoppingBasket,
  Calendar,
  TrendingUp,
  Check,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const data = [
  {
    id: 1,
    title: "Get more bookings from drivers in your area",
  },
  {
    id: 2,
    title: "No commission - you keep 100%",
  },
  {
    id: 3,
    title: "Manage your bookings in one place",
  },
  {
    id: 4,
    title: "Never miss a booking",
  },
];

export default function GaragePricing() {
  const router = useRouter();
  const handleGarageSignup = () => {
    router.push("/create-account/garage");
  };
  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4  gap-4">
      <div
        className="flex-1 lg:flex-1 text-white relative overflow-hidden rounded-2xl min-h-[50vh] lg:min-h-full"
        style={{
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 p-6 lg:p-12 flex flex-col justify-between h-full">
          <div>
            {/* back button */}
            <Link
              href="/create-account"
              className="flex justify-start cursor-pointer border border-white  rounded-full p-2 w-fit group mb-4"
            >
              <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center group-hover:scale-150 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 text-white shrink-0" />
              </div>
            </Link>

            <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center">
              <Link href="/">simplymot.co.uk</Link>
            </div>

            {/* Feature List */}
            <div className="space-y-3 lg:space-y-4 mt-20">
              <h2 className="text-lg md:text-xl lg:text-[28px] font-semibold font-inder">
                More MOT Bookings. One Simple System.
              </h2>
              {data.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Check className="w-4 h-4 lg:w-5 lg:h-5 text-white shrink-0" />
                  <span className="text-sm md:text-base lg:text-lg font-normal">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-4 lg:mt-0">
            <Image
              src={carImage}
              alt="Car with people illustration"
              className="max-w-xs sm:max-w-sm md:max-w-md w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Side - Pricing Card */}
      <div className="flex-1 lg:flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg border border-[#19CA32] rounded-2xl bg-white shadow-sm overflow-hidden">
          {/* Top Section */}
          <div className="p-8 pb-6 flex flex-col items-center text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              One Simple Plan
            </h2>

            <div className="my-4 flex items-baseline justify-center">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 mr-0.5">
                £
              </span>
              <span className="text-6xl sm:text-7xl font-extrabold text-gray-900 tracking-tight">
                49
              </span>
            </div>

            <p className="text-gray-500 font-medium text-base mb-6">/month</p>

            <button
              onClick={handleGarageSignup}
              className="w-full max-w-70 cursor-pointer bg-[#19CA32] hover:bg-green-600 text-white font-semibold py-3.5 px-6 rounded-xl text-base shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
            >
              Get Started
            </button>
          </div>

          {/* Horizontal Divider */}
          <div className="w-full border-t border-gray-200" />

          {/* Bottom Section */}
          <div className="p-8 pt-6 space-y-6">
            <p className="text-gray-600 text-sm leading-relaxed text-center sm:text-left">
              We believe in fairness and transparency - no hidden fees, no
              contracts, no commission, and no confusing tiers. Just full access
              for one simple price.
            </p>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Features
              </h3>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 text-[#19CA32]">
                    <Package className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">
                    Unlimited opportunity to receive MOT bookings 24/7.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 text-[#19CA32]">
                    <ShoppingBasket className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">
                    Boost your garage’s visibility.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 text-[#19CA32]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">
                    Opportunity to upsell and offer extra services!
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 text-[#19CA32]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">
                    No contract. No commission.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 text-[#19CA32]">
                    <Package className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">
                    Simple set up.
                  </p>
                </div>
              </div>
            </div>

            {/* Learn How It Works */}
            <div className="mt-8 pt-4 text-center w-full border-t border-gray-100">
              <Link
                href="/how-simply-mot-works-for-garages"
                className="text-[15px] font-medium text-gray-600 underline hover:text-[#19CA32] transition-colors duration-200"
              >
                Learn how Simply Mot works for garages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
