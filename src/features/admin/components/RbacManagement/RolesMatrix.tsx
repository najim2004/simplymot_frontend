"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Check, RotateCcw, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PERMISSION_GROUPS, ALL_PERMISSION_KEYS } from "./data";
import type { RoleItem, PermissionKey } from "./types";

interface RolesMatrixProps {
  roles: RoleItem[];
  searchQuery: string;
  moduleFilter: string;
  selectedRoleId: string;
  onSelectedRoleIdChange: (roleId: string) => void;
  onUpdateRolePermissions: (
    roleId: string,
    permissions: PermissionKey[],
  ) => void;
}

export function RolesMatrix({
  roles,
  searchQuery,
  moduleFilter,
  selectedRoleId,
  onSelectedRoleIdChange,
  onUpdateRolePermissions,
}: RolesMatrixProps) {
  const selectedRole =
    roles.find((r) => r.id === selectedRoleId) || roles[0];

  const [inspectorPermissions, setInspectorPermissions] = useState<
    PermissionKey[]
  >(selectedRole?.permissions || []);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rolesScrollRef = useRef<HTMLDivElement>(null);

  const updateScrollHint = useCallback(() => {
    const el = rolesScrollRef.current;
    if (!el) return;
    const remaining = el.scrollWidth - el.scrollLeft - el.clientWidth;
    setCanScrollRight(remaining > 4);
  }, []);

  useEffect(() => {
    const role = roles.find((r) => r.id === selectedRoleId) || roles[0];
    if (role) setInspectorPermissions(role.permissions);
  }, [selectedRoleId, roles]);

  useEffect(() => {
    updateScrollHint();
    const el = rolesScrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollHint);
    window.addEventListener("resize", updateScrollHint);

    const observer = new ResizeObserver(updateScrollHint);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollHint);
      window.removeEventListener("resize", updateScrollHint);
      observer.disconnect();
    };
  }, [roles, updateScrollHint]);

  const handleScrollRolesRight = () => {
    const el = rolesScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 160, behavior: "smooth" });
  };

  const filteredGroups = useMemo(() => {
    return PERMISSION_GROUPS.map((group) => {
      const matchesModule =
        moduleFilter === "all" || group.id === moduleFilter;
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
  }, [moduleFilter, searchQuery]);

  if (!selectedRole) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No roles available</p>
        </div>
      </div>
    );
  }

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
    <div className="space-y-6 rounded-lg border border-gray-300 bg-white p-6">
      {/* Role tabs — single-line horizontal scroll, no scrollbar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
        <span className="shrink-0 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Select Role:
        </span>

        <div className="relative min-w-0 flex-1">
          <div
            ref={rolesScrollRef}
            className="flex items-center gap-2 overflow-x-auto pr-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectedRoleIdChange(r.id)}
                className={`shrink-0 rounded-md px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  r.id === selectedRoleId
                    ? "bg-[#19CA32] text-white shadow-xs"
                    : "border border-gray-200 text-gray-500 hover:bg-green-50 hover:text-gray-900"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {canScrollRight && (
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center bg-linear-to-l from-white via-white/90 to-transparent pl-8">
              <button
                type="button"
                onClick={handleScrollRolesRight}
                title="Scroll for more roles"
                aria-label="Scroll for more roles"
                className="pointer-events-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-green-50 hover:text-[#19CA32]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Role Meta */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
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
                • {inspectorPermissions.length} of {ALL_PERMISSION_KEYS.length}{" "}
                privileges active
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

      {/* Grouped Permissions */}
      {filteredGroups.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-gray-500">
          No capabilities or permissions match your filter.
        </div>
      ) : (
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
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
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
      )}
    </div>
  );
}
