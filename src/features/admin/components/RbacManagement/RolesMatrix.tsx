"use client";

import { useState, useMemo, Fragment } from "react";
import {
  Lock,
  Plus,
  Search,
  Check,
  RotateCcw,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERMISSION_GROUPS, ALL_PERMISSION_KEYS } from "./data";
import type { RoleItem, PermissionKey } from "./types";

interface RolesMatrixProps {
  roles: RoleItem[];
  onOpenCreateRoleDialog: () => void;
  onUpdateRolePermissions: (
    roleId: string,
    permissions: PermissionKey[],
  ) => void;
}

export function RolesMatrix({
  roles,
  onOpenCreateRoleDialog,
  onUpdateRolePermissions,
}: RolesMatrixProps) {
  const [viewMode, setViewMode] = useState<"matrix" | "inspector">("matrix");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    roles.find((r) => r.id !== "super-admin")?.id ||
      roles[0]?.id ||
      "super-admin",
  );

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  // Working copy of permissions for inspector view
  const [inspectorPermissions, setInspectorPermissions] = useState<
    PermissionKey[]
  >(selectedRole?.permissions || []);

  // Sync working permissions when selecting a different role in inspector
  const handleSelectRoleInInspector = (roleId: string) => {
    setSelectedRoleId(roleId);
    const target = roles.find((r) => r.id === roleId);
    if (target) {
      setInspectorPermissions(target.permissions);
    }
  };

  // Filter permission groups based on search & module tab
  const filteredGroups = useMemo(() => {
    return PERMISSION_GROUPS.map((group) => {
      const matchesModule =
        selectedModule === "all" || group.id === selectedModule;
      if (!matchesModule) return null;

      const query = searchQuery.toLowerCase().trim();
      const matchedPermissions = group.permissions.filter((perm) => {
        if (!query) return true;
        return (
          perm.label.toLowerCase().includes(query) ||
          perm.description.toLowerCase().includes(query) ||
          group.name.toLowerCase().includes(query)
        );
      });

      if (matchedPermissions.length === 0) return null;

      return {
        ...group,
        permissions: matchedPermissions,
      };
    }).filter(Boolean) as typeof PERMISSION_GROUPS;
  }, [selectedModule, searchQuery]);

  // Matrix direct toggle handler
  const handleToggleMatrixPermission = (
    role: RoleItem,
    permKey: PermissionKey,
  ) => {
    if (
      role.id === "super-admin" ||
      (role.isSystem && role.id === "super-admin")
    ) {
      toast.info("Super Administrator permissions are immutable.");
      return;
    }

    const currentPerms = role.permissions;
    const hasPerm = currentPerms.includes(permKey);
    const newPerms = hasPerm
      ? currentPerms.filter((k) => k !== permKey)
      : [...currentPerms, permKey];

    onUpdateRolePermissions(role.id, newPerms);
    toast.success(
      `${hasPerm ? "Revoked" : "Granted"} privilege for ${role.name}`,
    );
  };

  // Inspector toggle handler
  const handleToggleInspectorPermission = (permKey: PermissionKey) => {
    if (selectedRole.id === "super-admin") {
      toast.info("Super Administrator permissions are immutable.");
      return;
    }

    setInspectorPermissions((prev) =>
      prev.includes(permKey)
        ? prev.filter((p) => p !== permKey)
        : [...prev, permKey],
    );
  };

  const handleToggleModuleInInspector = (keys: PermissionKey[]) => {
    if (selectedRole.id === "super-admin") return;
    const allEnabled = keys.every((k) => inspectorPermissions.includes(k));
    if (allEnabled) {
      setInspectorPermissions((prev) => prev.filter((k) => !keys.includes(k)));
    } else {
      setInspectorPermissions((prev) =>
        Array.from(new Set([...prev, ...keys])),
      );
    }
  };

  const handleSaveInspectorChanges = () => {
    onUpdateRolePermissions(selectedRole.id, inspectorPermissions);
    toast.success(`Saved permissions for ${selectedRole.name}`, {
      description: `${inspectorPermissions.length} of ${ALL_PERMISSION_KEYS.length} privileges active.`,
    });
  };

  const handleResetInspectorChanges = () => {
    setInspectorPermissions(selectedRole.permissions);
    toast.info("Reverted unsaved changes.");
  };

  return (
    <div className="space-y-0">
      {/* Top Filter & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
        {/* Search */}
        <div className="relative min-w-64 flex-1">
          <Search
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search capability or permission..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-md pl-9 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>

        {/* Module Filter Tabs & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Module Pills */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <button
              onClick={() => setSelectedModule("all")}
              className={`h-10 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                selectedModule === "all"
                  ? "bg-[#19CA32] text-white shadow-xs"
                  : "border border-gray-200 text-gray-500 hover:bg-green-50 hover:text-gray-900"
              }`}
            >
              All Modules
            </button>
            {PERMISSION_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedModule(g.id)}
                className={`h-10 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  selectedModule === g.id
                    ? "bg-[#19CA32] text-white shadow-xs"
                    : "border border-gray-200 text-gray-500 hover:bg-green-50 hover:text-gray-900"
                }`}
              >
                {g.name.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Matrix vs Inspector */}
          <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setViewMode("matrix")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-2 text-xs font-medium transition-colors ${
                viewMode === "matrix"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Matrix Comparison View"
            >
              <LayoutGrid size={13} />
              <span>Matrix Grid</span>
            </button>
            <button
              onClick={() => {
                setViewMode("inspector");
                setInspectorPermissions(selectedRole.permissions);
              }}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-2 text-xs font-medium transition-colors ${
                viewMode === "inspector"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Role-by-Role Inspector"
            >
              <ListFilter size={13} />
              <span>Role Inspector</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: AUTHENTIC MATRIX GRID */}
      {viewMode === "matrix" && (
        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader className="bg-gray-50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="min-w-64 px-4 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Platform Capability
                </TableHead>

                {roles.map((r) => (
                  <TableHead
                    key={r.id}
                    className="min-w-36 px-3 py-3.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-gray-900">{r.name}</span>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={`rounded-md border px-1.5 py-0 text-[10px] font-medium ${
                            r.isSystem
                              ? "border-purple-200/80 bg-purple-50 text-purple-700"
                              : "border-teal-200/80 bg-teal-50 text-teal-700"
                          }`}
                        >
                          {r.isSystem ? "System" : "Custom"}
                        </Badge>
                        <span className="font-mono text-[10px] text-gray-400">
                          {r.permissions.length} perms
                        </span>
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={roles.length + 1}
                    className="h-32 text-center text-sm text-gray-500"
                  >
                    No capabilities or permissions match your filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => {
                  const GroupIcon = group.icon;

                  return (
                    <Fragment key={group.id}>
                      {/* Section Module Banner Header */}
                      <TableRow className="border-gray-100 bg-gray-50/70 hover:bg-gray-50">
                        <TableCell
                          colSpan={roles.length + 1}
                          className="px-4 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[#DDF7E0] text-[#19CA32]">
                              <GroupIcon size={14} />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {group.name}
                            </span>
                            <span className="text-xs text-gray-500 font-normal">
                              — {group.description} ({group.permissions.length}{" "}
                              capabilities)
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Granular Permission Rows */}
                      {group.permissions.map((perm) => (
                        <TableRow
                          key={perm.key}
                          className="border-gray-100 transition-colors hover:bg-green-50/40"
                        >
                          <TableCell className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {perm.label}
                            </div>
                            <div className="text-xs leading-relaxed text-gray-500">
                              {perm.description}
                            </div>
                          </TableCell>

                          {roles.map((role) => {
                            const isSuperAdmin = role.id === "super-admin";
                            const isChecked =
                              isSuperAdmin ||
                              role.permissions.includes(perm.key);

                            return (
                              <TableCell
                                key={role.id}
                                className="px-3 py-3 text-center align-middle"
                              >
                                <div className="flex items-center justify-center">
                                  {isSuperAdmin ? (
                                    <span
                                      title="Super Administrator retains full master privileges"
                                      className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-purple-200/80 bg-purple-50 text-purple-700"
                                    >
                                      <Lock size={12} />
                                    </span>
                                  ) : (
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() =>
                                        handleToggleMatrixPermission(
                                          role,
                                          perm.key,
                                        )
                                      }
                                      aria-label={`Toggle ${perm.label} for ${role.name}`}
                                      className="size-4 rounded border-input data-[state=checked]:border-[#19CA32] data-[state=checked]:bg-[#19CA32] data-[state=checked]:text-white"
                                    />
                                  )}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* VIEW 2: ROLE INSPECTOR */}
      {viewMode === "inspector" && (
        <div className="space-y-6 p-6">
          {/* Role Picker Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Select Role:
            </span>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectRoleInInspector(r.id)}
                className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                  r.id === selectedRoleId
                    ? "bg-[#19CA32] text-white shadow-xs"
                    : "border border-gray-200 text-gray-500 hover:bg-green-50 hover:text-gray-900"
                }`}
              >
                {r.name}
              </button>
            ))}

            <Button
              size="sm"
              variant="outline"
              onClick={onOpenCreateRoleDialog}
              className="h-9 border-dashed border-gray-200 px-3 text-xs font-medium hover:border-[#19CA32]/60"
            >
              <Plus size={13} className="mr-1" />
              New Role
            </Button>
          </div>

          {/* Active Role Meta Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedRole.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                      selectedRole.isSystem
                        ? "border-purple-200/80 bg-purple-50 text-purple-700"
                        : "border-teal-200/80 bg-teal-50 text-teal-700"
                    }`}
                  >
                    {selectedRole.isSystem ? "System Role" : "Custom Role"}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    • {inspectorPermissions.length} of{" "}
                    {ALL_PERMISSION_KEYS.length} privileges active
                  </span>
                </div>
                <p className="max-w-2xl text-xs text-gray-500">
                  {selectedRole.description}
                </p>
              </div>

              {selectedRole.id !== "super-admin" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetInspectorChanges}
                    className="h-9 text-xs font-medium"
                  >
                    <RotateCcw size={12} className="mr-1.5" /> Revert
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveInspectorChanges}
                    className="h-9 cursor-pointer bg-[#19CA32] px-4 text-xs font-medium text-white shadow-xs hover:bg-green-600"
                  >
                    <Check size={13} className="mr-1.5" /> Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Grouped Permissions in Inspector */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGroups.map((group) => {
              const GroupIcon = group.icon;
              const groupKeys = group.permissions.map((p) => p.key);
              const allEnabled = groupKeys.every((k) =>
                inspectorPermissions.includes(k),
              );

              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <GroupIcon size={15} className="shrink-0 text-[#19CA32]" />
                      <span className="text-sm font-semibold text-gray-900">
                        {group.name}
                      </span>
                    </div>

                    {selectedRole.id !== "super-admin" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleModuleInInspector(groupKeys)}
                        className="h-7 text-xs font-medium hover:bg-green-50"
                      >
                        {allEnabled ? "Disable All" : "Enable All"}
                      </Button>
                    )}
                  </div>

                  <div className="divide-y divide-gray-100 p-1">
                    {group.permissions.map((perm) => {
                      const isChecked =
                        selectedRole.id === "super-admin" ||
                        inspectorPermissions.includes(perm.key);

                      return (
                        <div
                          key={perm.key}
                          onClick={() =>
                            handleToggleInspectorPermission(perm.key)
                          }
                          className={`flex items-start justify-between gap-3 rounded p-3 transition-colors ${
                            selectedRole.id === "super-admin"
                              ? "cursor-default"
                              : "cursor-pointer hover:bg-green-50/40"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium text-gray-900">
                              {perm.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {perm.description}
                            </div>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            {selectedRole.id === "super-admin" ? (
                              <CheckCircle2
                                size={16}
                                className="text-purple-600"
                              />
                            ) : (
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() =>
                                  handleToggleInspectorPermission(perm.key)
                                }
                                aria-label={`Toggle ${perm.label}`}
                                className="size-4 rounded border-input data-[state=checked]:border-[#19CA32] data-[state=checked]:bg-[#19CA32] data-[state=checked]:text-white"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
