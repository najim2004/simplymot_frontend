"use client";

import { useState, useMemo } from "react";
import { Search, X, RefreshCw, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_ROLES, INVITE_CANDIDATES } from "./data";
import type { StaffMember, RoleItem, InviteCandidate } from "./types";

interface InviteStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffInvited: (staff: StaffMember) => void;
  roles?: RoleItem[];
  existingStaff?: StaffMember[];
}

const DEPARTMENTS = [
  "Operations",
  "Warehouse & Logistics",
  "Customer Success",
  "Merchandising",
  "Finance & Accounting",
  "Engineering & IT",
  "Executive & IT",
  "Marketing",
];

export function InviteStaffDialog({
  open,
  onOpenChange,
  onStaffInvited,
  roles = DEFAULT_ROLES,
  existingStaff = [],
}: InviteStaffDialogProps) {
  const availableRoles = roles.length > 0 ? roles : DEFAULT_ROLES;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<InviteCandidate | null>(
    null,
  );
  const [roleId, setRoleId] = useState(
    availableRoles[1]?.id || availableRoles[0]?.id,
  );
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return INVITE_CANDIDATES;
    return INVITE_CANDIDATES.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleSelectUser = (userId: string) => {
    const user = INVITE_CANDIDATES.find((u) => u.id === userId) || null;
    setSelectedUser(user);
    setSearchQuery("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedUser(null);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Please select a user first.");
      return;
    }

    const isAlreadyStaff = existingStaff.some(
      (s) => s.email.toLowerCase() === selectedUser.email.toLowerCase(),
    );
    if (isAlreadyStaff) {
      toast.error(`${selectedUser.name} is already a staff member.`);
      return;
    }

    setIsSubmitting(true);

    const selectedRole =
      availableRoles.find((r) => r.id === roleId) || availableRoles[0];
    const initials = selectedUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    setTimeout(() => {
      const newStaff: StaffMember = {
        id: `STAFF-${Math.floor(100 + Math.random() * 900)}`,
        name: selectedUser.name,
        email: selectedUser.email,
        avatar: initials,
        roleId: selectedRole.id,
        roleName: selectedRole.name,
        department,
        status: "Active",
        lastLogin: "Active now",
        createdAt: "Just now",
        phone: selectedUser.phone || undefined,
      };

      onStaffInvited(newStaff);
      setIsSubmitting(false);
      handleClose();

      toast.success(`Added ${selectedUser.name} to staff team!`, {
        description: `${selectedRole.name} • ${department}`,
      });
    }, 400);
  };

  return (
    <CustomReusableModal
      isOpen={open}
      onClose={handleClose}
      title="Add Staff Member"
      showHeader={false}
      hideClose={true}
      className="flex max-w-md flex-col"
      contentClassName="flex min-h-0 flex-col overflow-hidden p-0"
    >
      <div className="flex max-h-[90vh] min-h-0 flex-col overflow-hidden rounded-lg bg-white">
        <div className="flex shrink-0 items-center justify-between bg-linear-to-r from-[#19CA32] to-[#16b82e] px-5 py-4 text-white shadow-md">
          <div>
            <h2 className="text-lg font-semibold">Add Staff Member</h2>
            <p className="mt-0.5 text-xs text-white/90">
              Search an existing user account to assign their staff role
            </p>
          </div>
          <UserRoundPlus className="h-5 w-5 opacity-90" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 overflow-y-auto p-5"
        >
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              User Account
            </Label>

            {selectedUser ? (
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#19CA32] text-xs font-bold text-white">
                    {selectedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {selectedUser.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  className="h-8 cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    autoFocus
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 rounded-md border-gray-300 pr-8 pl-9 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-900"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="max-h-44 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xs">
                  {filteredUsers.length === 0 ? (
                    <p className="p-3 text-center text-xs text-gray-500">
                      No user found with &ldquo;{searchQuery}&rdquo;.
                    </p>
                  ) : (
                    filteredUsers.map((u) => {
                      const isAlreadyStaff = existingStaff.some(
                        (s) =>
                          s.email.toLowerCase() === u.email.toLowerCase(),
                      );
                      const initials = u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={u.id}
                          onClick={() =>
                            !isAlreadyStaff && handleSelectUser(u.id)
                          }
                          className={`flex cursor-pointer items-center justify-between p-2.5 transition-colors ${
                            isAlreadyStaff
                              ? "cursor-not-allowed bg-gray-50 opacity-50"
                              : "hover:bg-green-50"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green-100 text-[11px] font-bold text-[#19CA32]">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-gray-900">
                                {u.name}
                              </p>
                              <p className="truncate text-[11px] text-gray-500">
                                {u.email}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            {isAlreadyStaff ? (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                Already Staff
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-[#19CA32] hover:underline">
                                Select
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            <div className="min-w-0 space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="h-11 w-full border-gray-300 bg-white text-sm focus:ring-[#19CA32]/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Department
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-11 w-full border-gray-300 bg-white text-sm focus:ring-[#19CA32]/20">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
            <Button
              type="submit"
              disabled={!selectedUser || isSubmitting}
              className="h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#19CA32] to-[#16b82e] font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="mr-1.5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserRoundPlus size={14} className="mr-1.5" />
                  Add Staff
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-11 cursor-pointer rounded-lg font-semibold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </CustomReusableModal>
  );
}
