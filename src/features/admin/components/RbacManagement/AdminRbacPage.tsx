"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Search,
  X,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminStatsCards } from "../shared/AdminStatsCards";
import {
  DEFAULT_ROLES,
  INITIAL_STAFF_MEMBERS,
  INITIAL_AUDIT_LOGS,
  RBAC_STATS,
  PERMISSION_GROUPS,
} from "./data";
import { StaffTable } from "./StaffTable";
import { RolesMatrix } from "./RolesMatrix";
import { AuditLogsTable } from "./AuditLogsTable";
import { InviteStaffDialog } from "./InviteStaffDialog";
import { CreateRoleDialog } from "./CreateRoleDialog";
import { ViewStaffModal } from "./ViewStaffModal";
import type {
  StaffMember,
  RoleItem,
  RbacAuditLog,
  PermissionKey,
} from "./types";

type RbacTab = "staff" | "roles" | "audit";

interface AdminRbacPageProps {
  initialTab?: RbacTab;
}

export function AdminRbacPage({ initialTab = "staff" }: AdminRbacPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") as RbacTab | null;
  const activeTab = tabParam || initialTab;

  const [staffList, setStaffList] = useState<StaffMember[]>(
    INITIAL_STAFF_MEMBERS,
  );
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [auditLogs, setAuditLogs] = useState<RbacAuditLog[]>(INITIAL_AUDIT_LOGS);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [viewStaff, setViewStaff] = useState<StaffMember | null>(null);

  const [staffSearch, setStaffSearch] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState("all");

  const [rolesSearch, setRolesSearch] = useState("");
  const [rolesModuleFilter, setRolesModuleFilter] = useState("all");
  const [selectedRoleId, setSelectedRoleId] = useState(
    DEFAULT_ROLES.find((r) => r.id !== "super-admin")?.id ||
      DEFAULT_ROLES[0]?.id ||
      "super-admin",
  );

  const [auditSearch, setAuditSearch] = useState("");
  const [auditStatusFilter, setAuditStatusFilter] = useState("all");

  const handleTabChange = (newTab: RbacTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const searchValue =
    activeTab === "staff"
      ? staffSearch
      : activeTab === "roles"
        ? rolesSearch
        : auditSearch;

  const searchPlaceholder =
    activeTab === "staff"
      ? "Search staff..."
      : activeTab === "roles"
        ? "Search permissions..."
        : "Search audit logs...";

  const handleSearchChange = (value: string) => {
    if (activeTab === "staff") setStaffSearch(value);
    else if (activeTab === "roles") setRolesSearch(value);
    else setAuditSearch(value);
  };

  const handleClearSearch = () => handleSearchChange("");

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
    setSelectedRoleId(newRole.id);

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
    <div>
      {/* Header — matches garage / booking / vehicles */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="whitespace-nowrap text-2xl font-bold text-gray-900">
          RBAC & Roles
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {activeTab === "staff" && (
            <div className="w-full sm:w-44">
              <Select
                value={staffRoleFilter}
                onValueChange={setStaffRoleFilter}
              >
                <SelectTrigger className="h-11 w-full cursor-pointer border-gray-300 bg-white text-xs sm:text-sm">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="w-full sm:w-44">
              <Select
                value={rolesModuleFilter}
                onValueChange={setRolesModuleFilter}
              >
                <SelectTrigger className="h-11 w-full cursor-pointer border-gray-300 bg-white text-xs sm:text-sm">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {PERMISSION_GROUPS.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="w-full sm:w-44">
              <Select
                value={auditStatusFilter}
                onValueChange={setAuditStatusFilter}
              >
                <SelectTrigger className="h-11 w-full cursor-pointer border-gray-300 bg-white text-xs sm:text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="relative w-full sm:w-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block h-11 w-full rounded-lg border border-gray-300 bg-white py-0 pr-9 pl-9 text-xs leading-5 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none sm:w-64 sm:text-sm"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-1 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {activeTab === "staff" && (
            <Button
              onClick={() => setInviteOpen(true)}
              className="h-11 cursor-pointer bg-[#19CA32] px-4 text-sm font-semibold text-white hover:bg-green-600"
            >
              <UserPlus className="mr-1 h-4 w-4" /> Add Staff
            </Button>
          )}

          {activeTab === "roles" && (
            <Button
              onClick={() => setCreateRoleOpen(true)}
              className="h-11 cursor-pointer bg-[#19CA32] px-4 text-sm font-semibold text-white hover:bg-green-600"
            >
              <Plus className="mr-1 h-4 w-4" /> New Role
            </Button>
          )}
        </div>
      </div>

      <AdminStatsCards stats={RBAC_STATS} />

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-1 overflow-x-auto border-b border-gray-200 sm:gap-6">
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
            className={
              activeTab === "staff" ? "text-[#19CA32]" : "text-gray-500"
            }
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
            className={
              activeTab === "roles" ? "text-[#19CA32]" : "text-gray-500"
            }
          />
          <span>Roles & Permissions</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
              activeTab === "roles"
                ? "bg-green-100 font-semibold text-[#19CA32]"
                : "bg-gray-100 text-gray-500"
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
            className={
              activeTab === "audit" ? "text-[#19CA32]" : "text-gray-500"
            }
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

      {/* Tab Content */}
      {activeTab === "staff" && (
        <StaffTable
          staffList={staffList}
          roles={roles}
          searchQuery={staffSearch}
          roleFilter={staffRoleFilter}
          onViewStaff={setViewStaff}
          onToggleStaffStatus={handleToggleStaffStatus}
          onChangeStaffRole={handleChangeStaffRole}
          onRemoveStaff={handleRemoveStaff}
        />
      )}

      {activeTab === "roles" && (
        <RolesMatrix
          roles={roles}
          searchQuery={rolesSearch}
          moduleFilter={rolesModuleFilter}
          selectedRoleId={selectedRoleId}
          onSelectedRoleIdChange={setSelectedRoleId}
          onUpdateRolePermissions={handleUpdateRolePermissions}
        />
      )}

      {activeTab === "audit" && (
        <AuditLogsTable
          logs={auditLogs}
          searchQuery={auditSearch}
          statusFilter={auditStatusFilter}
        />
      )}

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

      <ViewStaffModal
        isOpen={Boolean(viewStaff)}
        staff={viewStaff}
        roles={roles}
        onClose={() => setViewStaff(null)}
      />
    </div>
  );
}
