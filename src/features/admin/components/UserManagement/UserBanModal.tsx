"use client";

import React from "react";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Ban as BanIcon, CheckCircle } from "lucide-react";

interface UserBanModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBanned: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const UserBanModal: React.FC<UserBanModalProps> = ({
  isOpen,
  onClose,
  isBanned,
  reason,
  onReasonChange,
  onConfirm,
  isLoading,
}) => {
  const isBanAction = !isBanned;

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      showHeader
      className="max-w-sm"
      title={isBanAction ? "Ban User" : "Unban User"}
      description={
        isBanAction
          ? "Provide a reason for banning this user."
          : "Confirm unbanning this user."
      }
      icon={
        isBanAction ? (
          <BanIcon className="w-5 h-5" />
        ) : (
          <CheckCircle className="w-5 h-5" />
        )
      }
      variant={isBanAction ? "danger" : "success"}
    >
      <div className="space-y-4">
        {isBanAction && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <input
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              type="text"
              placeholder="Write a short reason (optional)"
              className="w-full h-10 rounded-md border border-gray-300 px-3 focus:outline-none"
            />
          </div>
        )}
        <p className="text-sm text-gray-700">
          Are you sure you want to {isBanAction ? "ban" : "unban"} this user?
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className={`${
              isBanAction
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            } cursor-pointer`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm"}
          </Button>
        </div>
      </div>
    </CustomReusableModal>
  );
};

export default UserBanModal;
