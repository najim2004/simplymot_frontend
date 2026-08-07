"use client";

import React from "react";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface RoleItem {
  id: string;
  name: string;
  title?: string;
}

interface AssignRolesConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoles: RoleItem[];
  onConfirm: () => void;
  isLoading: boolean;
}

export const AssignRolesConfirmModal: React.FC<AssignRolesConfirmModalProps> = ({
  isOpen,
  onClose,
  selectedRoles,
  onConfirm,
  isLoading,
}) => {
  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      showHeader
      className="max-w-sm"
      title="Assign Roles"
      description={`You are assigning ${selectedRoles.length} role(s) to this user.`}
      icon={<Shield className="w-5 h-5" />}
      variant="default"
    >
      <div className="space-y-3 text-sm text-gray-700">
        <ul className="list-disc pl-5 max-h-40 overflow-auto">
          {selectedRoles.map((r) => (
            <li key={r.id}>{r.title || r.name}</li>
          ))}
        </ul>
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
            className="bg-[#19CA32] hover:bg-[#19CA32]/90 text-white cursor-pointer"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Confirm Assign"}
          </Button>
        </div>
      </div>
    </CustomReusableModal>
  );
};

export default AssignRolesConfirmModal;
