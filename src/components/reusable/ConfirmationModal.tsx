import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const variantConfig = {
    danger: {
      icon: Trash2,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      confirmBtnClass: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      confirmBtnClass: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      confirmBtnClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    success: {
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      confirmBtnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  };

  const config = variantConfig[variant] || variantConfig.danger;
  const Icon = config.icon;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && !isLoading && onClose()}
    >
      <AlertDialogContent className="max-w-md p-6 bg-white rounded-2xl border border-gray-100 shadow-xl">
        <AlertDialogHeader className="space-y-0">
          <div className="flex items-start gap-4 text-left">
            <div
              className={`p-3 rounded-xl ${config.bgColor} ${config.borderColor} border shrink-0`}
            >
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>

            <div className="space-y-1">
              <AlertDialogTitle className="text-lg font-bold text-gray-900 tracking-tight">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 text-sm leading-relaxed">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`${config.confirmBtnClass} w-full py-2.5 font-medium rounded-lg text-sm transition-colors cursor-pointer m-0 shadow-xs flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2.5 text-gray-700 font-medium bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm transition-colors cursor-pointer m-0"
          >
            {cancelText}
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
