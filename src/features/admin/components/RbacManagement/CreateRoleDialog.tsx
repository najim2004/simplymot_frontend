"use client";

import { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_ROLES } from "./data";
import type { RoleItem } from "./types";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated: (newRole: RoleItem) => void;
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  onRoleCreated,
}: CreateRoleDialogProps) {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [cloneFromRoleId, setCloneFromRoleId] = useState(DEFAULT_ROLES[1].id);

  const handleClose = () => {
    setRoleName("");
    setDescription("");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Please enter a name for the new role.");
      return;
    }

    const templateRole =
      DEFAULT_ROLES.find((r) => r.id === cloneFromRoleId) || DEFAULT_ROLES[1];

    const newRole: RoleItem = {
      id: `role-${Date.now()}`,
      name: roleName.trim(),
      description:
        description.trim() || `Custom role cloned from ${templateRole.name}`,
      color: "text-teal-700 border-teal-300 bg-teal-50",
      badgeBg: "bg-teal-100 text-teal-900 border-teal-300",
      isSystem: false,
      usersCount: 0,
      permissions: [...templateRole.permissions],
    };

    onRoleCreated(newRole);
    handleClose();
    toast.success(`Role "${newRole.name}" created!`);
  };

  return (
    <CustomReusableModal
      isOpen={open}
      onClose={handleClose}
      title="Create Custom Role"
      showHeader={false}
      hideClose={true}
      className="flex max-w-md flex-col"
      contentClassName="flex min-h-0 flex-col overflow-hidden p-0"
    >
      <div className="flex max-h-[90vh] min-h-0 flex-col overflow-hidden rounded-lg bg-white">
        <div className="flex shrink-0 items-center justify-between bg-linear-to-r from-[#19CA32] to-[#16b82e] px-5 py-4 text-white shadow-md">
          <div>
            <h2 className="text-lg font-semibold">Create Custom Role</h2>
            <p className="mt-0.5 text-xs text-white/90">
              Define a tailored role with specific permission boundaries
            </p>
          </div>
          <ShieldCheck className="h-5 w-5 opacity-90" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 overflow-y-auto p-5"
        >
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Role Name <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Returns Coordinator, VIP Concierge"
              className="h-11 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the responsibilities and scope..."
              className="h-20 resize-none text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Initial Permissions (Clone from template)
            </Label>
            <Select
              value={cloneFromRoleId}
              onValueChange={setCloneFromRoleId}
            >
              <SelectTrigger className="h-11 w-full border-gray-300 bg-white text-sm focus:ring-[#19CA32]/20">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {DEFAULT_ROLES.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.permissions.length} perms)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              You will be able to check or uncheck individual privileges in the
              Matrix.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
            <Button
              type="submit"
              disabled={!roleName.trim()}
              className="h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#19CA32] to-[#16b82e] font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-50"
            >
              <Plus size={14} className="mr-1.5" />
              Create Role
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
