"use client";

import { useState, useMemo } from "react";
import { Search, X, RefreshCw, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<
    InviteCandidate | null
  >(null);
  const [roleId, setRoleId] = useState(availableRoles[1]?.id || availableRoles[0]?.id);
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
    setSelectedUserId(userId);
    setSearchQuery("");
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      setSelectedUser(null);
      setSelectedUserId(null);
      setSearchQuery("");
    }
    onOpenChange(next);
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
      handleClose(false);

      toast.success(`Added ${selectedUser.name} to staff team!`, {
        description: `${selectedRole.name} • ${department}`,
      });
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white p-6 sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Add Staff Member
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Search an existing user account to assign their staff role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* User Selection Field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-900">
              User Account
            </Label>

            {selectedUser ? (
              /* Selected User Chip */
              <div className="flex items-center justify-between rounded-md border border-green-200/60 bg-green-50 p-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#19CA32] text-xs font-bold text-white">
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
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedUserId(null);
                  }}
                  className="h-7 text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  Change
                </Button>
              </div>
            ) : (
              /* User Search Input & Dropdown Results */
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
                    className="h-10 rounded-md border-gray-200 pl-9 pr-8 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown list of accounts */}
                <div className="max-h-44 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-xs">
                  {filteredUsers.length === 0 ? (
                    <p className="p-3 text-center text-xs text-gray-500">
                      No user found with &ldquo;{searchQuery}&rdquo;.
                    </p>
                  ) : (
                    filteredUsers.map((u) => {
                      const isAlreadyStaff = existingStaff.some(
                        (s) => s.email.toLowerCase() === u.email.toLowerCase(),
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
                          onClick={() => !isAlreadyStaff && handleSelectUser(u.id)}
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

          {/* Role and Department in 1 row, 2 columns with full width */}
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="min-w-0 space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Role</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="h-10 w-full bg-white text-xs text-gray-900 focus:ring-[#19CA32]/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="text-xs">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-10 w-full bg-white text-xs text-gray-900 focus:ring-[#19CA32]/20">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons with generous gap */}
          <DialogFooter className="flex flex-row items-center justify-end gap-3 pt-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="h-9 cursor-pointer px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedUser || isSubmitting}
              className="h-9 cursor-pointer bg-[#19CA32] px-4 text-xs font-semibold text-white shadow-xs hover:bg-green-600"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={13} className="mr-1.5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserRoundPlus size={13} className="mr-1.5" />
                  Add Staff Member
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
