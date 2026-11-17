"use client";

import { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
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
    onOpenChange(false);
    setRoleName("");
    setDescription("");
    toast.success(`Role "${newRole.name}" created!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-green-100 text-[#19CA32]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Create Custom Role
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Define a tailored role with specific permission boundaries.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-900">
              Role Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Returns Coordinator, VIP Concierge"
              className="h-10 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-900">
              Description
            </Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the responsibilities and scope..."
              className="text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-900">
              Initial Permissions (Clone from template)
            </Label>
            <Select value={cloneFromRoleId} onValueChange={setCloneFromRoleId}>
              <SelectTrigger className="h-10 w-full bg-white text-xs text-gray-900 focus:ring-[#19CA32]/20">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {DEFAULT_ROLES.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.name} ({r.permissions.length} perms)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-500">
              You will be able to check or uncheck individual privileges in the
              Matrix.
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-3 pt-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 cursor-pointer px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!roleName.trim()}
              className="h-10 cursor-pointer bg-[#19CA32] px-4 text-xs font-bold text-white shadow-xs hover:bg-green-600"
            >
              <Plus size={13} className="mr-1.5" />
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
