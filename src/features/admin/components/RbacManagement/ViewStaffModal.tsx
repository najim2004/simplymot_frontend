"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Calendar,
  Building2,
  ShieldCheck,
  User as UserIcon,
  Clock,
} from "lucide-react";
import type { StaffMember, RoleItem } from "./types";

interface ViewStaffModalProps {
  isOpen: boolean;
  staff: StaffMember | null;
  roles: RoleItem[];
  onClose: () => void;
}

export function ViewStaffModal({
  isOpen,
  staff,
  roles,
  onClose,
}: ViewStaffModalProps) {
  if (!staff) return null;

  const roleObj = roles.find((r) => r.id === staff.roleId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <UserIcon className="h-5 w-5 text-gray-700" />
            Staff Member Details
          </DialogTitle>
          <DialogDescription>
            Account and role information for {staff.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white bg-[#DDF7E0] text-lg font-bold text-[#19CA32] shadow-sm">
              {staff.avatar || staff.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 space-y-1.5">
              <h3 className="truncate text-base font-semibold text-gray-900">
                {staff.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    staff.status === "Active"
                      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                      : staff.status === "Invited"
                        ? "border-blue-200 bg-blue-100 text-blue-800"
                        : "border-gray-200 bg-gray-100 text-gray-600"
                  }`}
                >
                  {staff.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                    roleObj?.badgeBg ||
                    "border-zinc-200 bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {staff.roleName}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Email</p>
                <p className="truncate text-sm text-gray-900">{staff.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">
                  {staff.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Department</p>
                <p className="text-sm text-gray-900">{staff.department}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Assigned Role</p>
                <p className="text-sm text-gray-900">{staff.roleName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Last Active</p>
                <p className="text-sm text-gray-900">{staff.lastLogin}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Joined</p>
                <p className="text-sm text-gray-900">{staff.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
