"use client";

import React, { useCallback, useEffect, useState } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export interface BenefitType {
  id: number;
  text: string;
  highlight?: boolean;
}

interface BenefitCarouselProps {
  benefits: BenefitType[];
  options?: EmblaOptionsType;
  autoplay?: boolean;
  autoplayDelay?: number;
}

const BenefitCarousel: React.FC<BenefitCarouselProps> = ({
  benefits,
  options = { loop: true, align: "center", dragFree: true },
  autoplay = true,
  autoplayDelay = 3000,
}) => {
  const plugins = autoplay
    ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
    : [];
  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit();
    onSelect();
    emblaApi.on("reInit", onInit);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onInit, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  return (
    <div className="benefit-carousel">
      {/* Carousel Container */}
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex touch-pan-y py-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="flex-none w-full md:w-1/2 lg:w-1/4 px-4"
            >
              <div
                className="
      p-8 rounded-[20px] bg-white h-full 
      flex items-center justify-center min-h-[180px]
      border border-[#00b050] 
      shadow-[0_0_10px_rgba(66,133,244,0.9)] 
      transition-all duration-300
    "
              >
                <p className="text-[#00b050] font-bold text-xl text-center leading-tight">
                  “{benefit.text}”
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center mt-8 space-x-3">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-5 h-2 cursor-pointer rounded-full transition-all duration-300 ease-in-out focus:outline-none  ${
              index === selectedIndex
                ? "bg-[#19CA32] scale-125 w-6"
                : "bg-[#B8EFBF]"
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BenefitCarousel;
