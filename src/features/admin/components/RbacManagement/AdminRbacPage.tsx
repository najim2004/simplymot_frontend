"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Users, ShieldCheck, ShieldAlert, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_ROLES,
  INITIAL_STAFF_MEMBERS,
  INITIAL_AUDIT_LOGS,
  RBAC_STATS,
} from "./data";
import { RbacStats } from "./RbacStats";
import { StaffTable } from "./StaffTable";
import { RolesMatrix } from "./RolesMatrix";
import { AuditLogsTable } from "./AuditLogsTable";
import { InviteStaffDialog } from "./InviteStaffDialog";
import { CreateRoleDialog } from "./CreateRoleDialog";
import type {
  StaffMember,
  RoleItem,
  RbacAuditLog,
  RbacStat,
  PermissionKey,
} from "./types";

interface AdminRbacPageProps {
  initialTab?: "staff" | "roles" | "audit";
}

export function AdminRbacPage({ initialTab = "staff" }: AdminRbacPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") as
    | "staff"
    | "roles"
    | "audit"
    | null;
  const activeTab = tabParam || initialTab;

  const [staffList, setStaffList] = useState<StaffMember[]>(
    INITIAL_STAFF_MEMBERS,
  );
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [auditLogs, setAuditLogs] = useState<RbacAuditLog[]>(INITIAL_AUDIT_LOGS);

  // Dialog states
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);

  // Tab change with search param sync
  const handleTabChange = (newTab: "staff" | "roles" | "audit") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handlers
  const handleStaffInvited = (newStaff: StaffMember) => {
    setStaffList([newStaff, ...staffList]);

    const newLog: RbacAuditLog = {
      id: `LOG-${Date.now()}`,
      actorName: "Najim Ahmed",
      actorEmail: "najim@simplymot.com",
      actorRole: "Super Administrator",
      action: "Invited New Staff Member",
      resource: `Staff: ${newStaff.email}`,
      details: `Granted role '${newStaff.roleName}' in department '${newStaff.department}'`,
      timestamp: "Just now",
      ip: "103.21.44.12",
      status: "Success",
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleToggleStaffStatus = (staff: StaffMember) => {
    const nextStatus = staff.status === "Active" ? "Inactive" : "Active";
    setStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, status: nextStatus } : s)),
    );
    toast.info(`Account status for ${staff.name} changed to ${nextStatus}.`);
  };

  const handleChangeStaffRole = (staff: StaffMember, newRoleId: string) => {
    const targetRole = roles.find((r) => r.id === newRoleId);
    if (!targetRole) return;

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staff.id
          ? { ...s, roleId: targetRole.id, roleName: targetRole.name }
          : s,
      ),
    );

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === newRoleId) return { ...r, usersCount: r.usersCount + 1 };
        if (r.id === staff.roleId)
          return { ...r, usersCount: Math.max(0, r.usersCount - 1) };
        return r;
      }),
    );

    toast.success(`Role for ${staff.name} updated to ${targetRole.name}.`);
  };

  const handleRemoveStaff = (staff: StaffMember) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
    toast.error(`Revoked administrator access for ${staff.name}.`);
  };

  const handleRoleCreated = (newRole: RoleItem) => {
    setRoles([...roles, newRole]);

    const newLog: RbacAuditLog = {
      id: `LOG-${Date.now()}`,
      actorName: "Najim Ahmed",
      actorEmail: "najim@simplymot.com",
      actorRole: "Super Administrator",
      action: "Created Custom Role",
      resource: `Role: ${newRole.name}`,
      details: `Initialized new role with ${newRole.permissions.length} permissions`,
      timestamp: "Just now",
      ip: "103.21.44.12",
      status: "Success",
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleUpdateRolePermissions = (
    roleId: string,
    permissions: PermissionKey[],
  ) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions } : r)),
    );

    const updatedRole = roles.find((r) => r.id === roleId);
    const newLog: RbacAuditLog = {
      id: `LOG-${Date.now()}`,
      actorName: "Najim Ahmed",
      actorEmail: "najim@simplymot.com",
      actorRole: "Super Administrator",
      action: "Updated Role Privileges",
      resource: `Role: ${updatedRole?.name || roleId}`,
      details: `Updated active permissions count to ${permissions.length}`,
      timestamp: "Just now",
      ip: "103.21.44.12",
      status: "Success",
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8">
      {/* Top Overview KPI Cards */}
      <RbacStats stats={RBAC_STATS} />

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200">
        <div className="flex items-center gap-1 overflow-x-auto sm:gap-6">
          <button
            type="button"
            onClick={() => handleTabChange("staff")}
            className={`relative flex cursor-pointer items-center gap-2 pb-3.5 pt-1 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "staff"
                ? "font-semibold text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users
              size={16}
              className={activeTab === "staff" ? "text-[#19CA32]" : "text-gray-500"}
            />
            <span>Team Members</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                activeTab === "staff"
                  ? "bg-green-100 font-semibold text-[#19CA32]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {staffList.length}
            </span>
            {activeTab === "staff" && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[#19CA32]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("roles")}
            className={`relative flex cursor-pointer items-center gap-2 pb-3.5 pt-1 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "roles"
                ? "font-semibold text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ShieldCheck
              size={16}
              className={activeTab === "roles" ? "text-[#19CA32]" : "text-gray-500"}
            />
            <span>Roles & Permissions Matrix</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                activeTab === "roles"
                  ? "bg-green-100 font-semibold text-[#19CA32]"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {roles.length}
            </span>
            {activeTab === "roles" && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[#19CA32]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("audit")}
            className={`relative flex cursor-pointer items-center gap-2 pb-3.5 pt-1 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "audit"
                ? "font-semibold text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ShieldAlert
              size={16}
              className={activeTab === "audit" ? "text-[#19CA32]" : "text-gray-500"}
            />
            <span>Security Audit Logs</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                activeTab === "audit"
                  ? "bg-green-100 font-semibold text-[#19CA32]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {auditLogs.length}
            </span>
            {activeTab === "audit" && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[#19CA32]" />
            )}
          </button>
        </div>

        <div className="pb-2">
          {activeTab === "roles" && (
            <Button
              size="sm"
              onClick={() => setCreateRoleOpen(true)}
              className="h-9 cursor-pointer bg-[#19CA32] px-3.5 text-sm font-medium text-white shadow-xs hover:bg-green-600"
            >
              <Plus size={14} className="mr-1.5" />
              New Role
            </Button>
          )}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-xs">
        {activeTab === "staff" && (
          <StaffTable
            staffList={staffList}
            roles={roles}
            onOpenInviteDialog={() => setInviteOpen(true)}
            onToggleStaffStatus={handleToggleStaffStatus}
            onChangeStaffRole={handleChangeStaffRole}
            onRemoveStaff={handleRemoveStaff}
          />
        )}

        {activeTab === "roles" && (
          <RolesMatrix
            roles={roles}
            onOpenCreateRoleDialog={() => setCreateRoleOpen(true)}
            onUpdateRolePermissions={handleUpdateRolePermissions}
          />
        )}

        {activeTab === "audit" && <AuditLogsTable logs={auditLogs} />}
      </div>

      {/* Modals */}
      <InviteStaffDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onStaffInvited={handleStaffInvited}
        roles={roles}
        existingStaff={staffList}
      />

      <CreateRoleDialog
        open={createRoleOpen}
        onOpenChange={setCreateRoleOpen}
        onRoleCreated={handleRoleCreated}
      />
    </div>
  );
}
