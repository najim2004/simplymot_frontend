"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  text = "Loading...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { container: "w-8 h-8", text: "text-xs font-medium" },
    md: { container: "w-14 h-14", text: "text-sm font-semibold" },
    lg: { container: "w-20 h-20", text: "text-base font-bold" },
    xl: { container: "w-28 h-28", text: "text-lg font-bold" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const wrapperClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md"
    : "w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 my-auto flex-1";

  return (
    <div className={wrapperClasses}>
      <div className="flex flex-col items-center justify-center space-y-4 text-center my-auto">
        {/* Perfectly Centered SVG Spinner */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Ambient Glow */}
          <div
            className={`absolute rounded-full bg-[#19CA32]/25 blur-xl animate-pulse ${currentSize.container}`}
          />

          {/* SVG Circular Loader */}
          <svg
            className={`${currentSize.container} animate-spin text-[#19CA32] relative z-10`}
            viewBox="0 0 50 50"
          >
            {/* Background Track */}
            <circle
              className="text-gray-200/80"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="20"
              cx="25"
              cy="25"
            />
            {/* Animated Progress Arc */}
            <circle
              className="text-[#19CA32]"
              strokeWidth="4"
              strokeDasharray="80, 200"
              strokeDashoffset="0"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="20"
              cx="25"
              cy="25"
            />
          </svg>

          {/* Center Brand Pulse Dot */}
          {size !== "sm" && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-[#19CA32] animate-ping opacity-75" />
            </div>
          )}
        </div>

        {/* Text */}
        {text && (
          <p
            className={`${currentSize.text} text-gray-700 tracking-wide animate-pulse max-w-xs`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

