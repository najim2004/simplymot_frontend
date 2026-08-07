"use client";

import React from "react";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface RoleChangeItem {
  id: string;
  name: string;
  title?: string;
}

export interface AssignResultData {
  data?: {
    roles_added?: number;
    roles_removed?: number;
    role_changes?: {
      added?: RoleChangeItem[];
      removed?: RoleChangeItem[];
    };
  };
}

interface AssignRolesResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignMessage: string;
  assignResult: AssignResultData | null;
}

export const AssignRolesResultModal: React.FC<AssignRolesResultModalProps> = ({
  isOpen,
  onClose,
  assignMessage,
  assignResult,
}) => {
  const resultData = assignResult?.data;

  const statItems = [
    { label: "Roles Added", count: resultData?.roles_added ?? 0, color: "text-emerald-700" },
    { label: "Roles Removed", count: resultData?.roles_removed ?? 0, color: "text-rose-600" },
  ];

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={onClose}
      showHeader
      className="max-w-lg"
      title="Roles Assigned"
      description=""
      icon={<Shield className="w-7 h-7" />}
      variant="success"
    >
      <div className="space-y-5 text-gray-800">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 transition-all duration-300 ease-out animate-in fade-in-50 slide-in-from-top-2">
          <p className="text-base font-semibold flex items-start gap-2">
            <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
            <span>{assignMessage || "Roles have been updated successfully."}</span>
          </p>
        </div>

        {resultData && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in-50 slide-in-from-bottom-2">
            {statItems.map((stat, idx) => (
              <div key={idx} className="rounded-md border border-gray-200 p-3">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {resultData?.role_changes?.added && resultData.role_changes.added.length > 0 && (
            <div className="transition-all duration-300 ease-out animate-in fade-in-50 slide-in-from-left-2">
              <p className="text-sm font-medium text-emerald-700">Added Roles</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {resultData.role_changes.added.map((r) => (
                  <li
                    key={r.id}
                    className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"
                  >
                    {r.title || r.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {resultData?.role_changes?.removed && resultData.role_changes.removed.length > 0 && (
            <div className="transition-all duration-300 ease-out animate-in fade-in-50 slide-in-from-right-2">
              <p className="text-sm font-medium text-rose-700">Removed Roles</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {resultData.role_changes.removed.map((r) => (
                  <li
                    key={r.id}
                    className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200"
                  >
                    {r.title || r.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            className="bg-[#19CA32] hover:bg-[#19CA32]/90 text-white cursor-pointer px-6"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </CustomReusableModal>
  );
};

export default AssignRolesResultModal;
