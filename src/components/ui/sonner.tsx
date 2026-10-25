"use client";

import React from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-sans text-sm",
          description: "group-[.toast]:text-gray-500 text-xs",
          actionButton:
            "group-[.toast]:bg-[#19CA32] group-[.toast]:text-white font-medium hover:bg-[#158a26]",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700",
          success:
            "!bg-[#F0FDF4] !text-[#14532D] !border-[#BBF7D0]",
          error:
            "!bg-[#FEF2F2] !text-[#7F1D1D] !border-[#FECACA]",
          warning:
            "!bg-[#FFFBEB] !text-[#78350F] !border-[#FDE68A]",
          info:
            "!bg-[#F0F9FF] !text-[#0C4A6E] !border-[#BAE6FD]",
        },
        style: {
          backgroundColor: "#ffffff",
          color: "#111827",
          borderColor: "#e5e7eb",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#19CA32]" />,
        info: <InfoIcon className="size-4 text-sky-600" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#19CA32]" />,
      }}
      {...props}
    />
  );
};

export { Toaster };

