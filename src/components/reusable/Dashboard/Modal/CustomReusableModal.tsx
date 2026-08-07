"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CustomReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHeader?: boolean;
  className?: string;
  contentClassName?: string;
  customHeader?: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  variant?: "default" | "danger" | "success";
  hideClose?: boolean;
}

export default function CustomReusableModal({
  isOpen,
  onClose,
  title = "Modal",
  children,
  showHeader = true,
  className = "",
  contentClassName,
  customHeader,
  icon,
  description,
  variant = "default",
  hideClose = false,
}: CustomReusableModalProps) {
  const accentClasses =
    variant === "danger"
      ? "bg-destructive/10 text-destructive ring-destructive/20"
      : variant === "success"
        ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
        : "bg-accent text-accent-foreground ring-accent";



  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        hideClose={hideClose}
        className={cn(
          "w-[min(100%,calc(100vw-1.5rem))] max-w-md max-h-[min(90dvh,calc(100vh-2rem))] gap-0 border p-0 overflow-hidden rounded-xl shadow-lg",
          className,
        )}
        onInteractOutside={(e) => {
          // Allow closing on outside click
          onClose();
        }}
        onEscapeKeyDown={(e) => {
          onClose();
        }}
      >
        {customHeader ? (
          <>
            {/* Visually hidden DialogTitle for accessibility */}
            <DialogTitle className="sr-only">{title}</DialogTitle>
            {customHeader}
          </>
        ) : (
          <DialogHeader className={showHeader ? "p-5 pb-0" : "sr-only"}>
            <div className="flex items-start gap-3">
              {icon ? (
                <div
                  className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full ring-4 ${accentClasses}`}
                >
                  {icon}
                </div>
              ) : null}
              <div className="flex-1">
                <DialogTitle
                  className={showHeader ? "text-lg font-semibold" : "sr-only"}
                >
                  {title}
                </DialogTitle>
                {description ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
          </DialogHeader>
        )}
        <div className={cn("p-5 min-w-0", contentClassName)}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
