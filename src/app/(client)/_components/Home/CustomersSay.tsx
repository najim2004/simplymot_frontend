import React from "react";
import LineImage from "@/public/Image/mot/line.png";
import Image from "next/image";
import BenefitCarousel from "@/components/reusable/BenefitCarousel";

export default function CustomersSay() {
  const benefits = [
    {
      id: 1,
      text: "Fast and simple MOT bookings",
    },
    {
      id: 2,
      text: "Choose from local, independent garages",
    },
    {
      id: 3,
      text: "Instant MOT due date checks",
    },
    {
      id: 4,
      text: "Manage your MOT in one place",
    },
    {
      id: 5,
      text: "No Upfront Payments",
    },
    {
      id: 6,
      text: "Book Anytime, Anywhere",
    },
    {
      id: 7,
      text: "Free MOT Reminders",
    },
    {
      id: 8,
      text: "Find Trusted MOT Garages Near You",
    },
  ];

  return (
    <div className="container px-5 2xl:px-0 py-16">
      {/* Title Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
          Why drivers use{" "}
          <span className="relative inline-block">
            simplymot.co.uk
            <Image
              src={LineImage}
              alt=""
              className="absolute -bottom-5 left-0 w-full h-auto"
              width={400}
              height={25}
            />
          </span>
        </h2>
      </div>

      {/* Benefit Carousel */}
      <BenefitCarousel
        benefits={benefits}
        autoplay={true}
        autoplayDelay={4000}
      />
    </div>
  );
}
