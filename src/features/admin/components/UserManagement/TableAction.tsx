"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Pencil,
  Ban as BanIcon,
  CheckCircle,
  UserPlus,
  UserMinus,
  Shield,
} from "lucide-react";
import RoleList from "./RoleList";
import {
  useBanUserMutation,
  useUnbanUserMutation,
  useGetRolesQuery,
  useAssignRoleToUserMutation,
  useRemoveRoleFromUserMutation,
  setUserRoles,
} from "@/features/admin";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import UserBanModal from "./UserBanModal";
import AssignRolesConfirmModal from "./AssignRolesConfirmModal";
import AssignRolesResultModal from "./AssignRolesResultModal";

interface TableActionProps {
  row: any;
  onEditClick?: (userId: string) => void;
}

export default function TableAction({ row, onEditClick }: TableActionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [banUser, { isLoading: banning }] = useBanUserMutation();
  const [unbanUser, { isLoading: unbanning }] = useUnbanUserMutation();
  const [assignRole, { isLoading: assigning }] = useAssignRoleToUserMutation();
  const [removeRole, { isLoading: removing }] = useRemoveRoleFromUserMutation();
  const { data: fetchedRolesResp } = useGetRolesQuery();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    Array.isArray(row.roles) ? row.roles.map((r: any) => r.id) : []
  );
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [assignResultOpen, setAssignResultOpen] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");
  const [assignResult, setAssignResult] = useState<any>(null);

  const isSuperAdmin = Array.isArray(row.roles) && row.roles.some((r: any) => r.name === "super_admin");
  const isAdminAccount = String(row?.type) === "ADMIN";
  const isBanned = row?.status === "Banned";
  const canBan = row?.status === "Active" || row?.status === "Pending";

  const allRoles = fetchedRolesResp?.data?.roles || [];
  const selectedRoles = useMemo(
    () => allRoles.filter((r: any) => selectedRoleIds.includes(r.id)),
    [allRoles, selectedRoleIds]
  );

  const handleBanUnban = async () => {
    try {
      if (!isBanned) {
        const res = await banUser({ id: row.id, reason }).unwrap();
        if ((res as any)?.success === false) {
          toast.error((res as any)?.message || "Operation failed");
        } else {
          toast.success("User banned successfully");
        }
      } else {
        const res = await unbanUser(row.id).unwrap();
        if ((res as any)?.success === false) {
          toast.error((res as any)?.message || "Operation failed");
        } else {
          toast.success("User unbanned successfully");
        }
      }
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Operation failed");
    }
  };

  const handleAssignRoles = async () => {
    try {
      const res = await assignRole({ id: row.id, role_ids: selectedRoleIds }).unwrap();
      if ((res as any)?.success === false) {
        toast.error((res as any)?.message || "Operation failed");
      } else {
        toast.success("Roles updated");
        const roles = allRoles.filter((r: any) => selectedRoleIds.includes(r.id));
        dispatch(setUserRoles({ id: row.id, roles }));
        setSelectedRoleIds(roles.map((r: any) => r.id));
        setConfirmAssignOpen(false);
        const msg = (res as any)?.message;
        if (msg) {
          setAssignMessage(msg);
          setAssignResult(res);
          setTimeout(() => setAssignResultOpen(true), 700);
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleRemoveRole = async (role: any) => {
    if (role.name === "super_admin") return;
    setDropdownOpen(false);
    try {
      const res = await removeRole({ id: row.id, role_id: role.id }).unwrap();
      if ((res as any)?.success === false) {
        toast.error((res as any)?.message || "Operation failed");
      } else {
        const remainingRoles = (row.roles || []).filter((rr: any) => rr.id !== role.id);
        dispatch(setUserRoles({ id: row.id, roles: remainingRoles }));
        setSelectedRoleIds((prev) => prev.filter((rid) => rid !== role.id));
        toast.success("Role removed");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="bg-gray-100 cursor-pointer text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={() => setDropdownOpen(false)}
      >
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(false);
            setTimeout(() => router.push(`/admin/users-management/${row.id}`), 150);
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>

        {!isSuperAdmin && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false);
              setTimeout(() => onEditClick?.(row.id), 150);
            }}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit User
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {!isSuperAdmin && (canBan || isBanned) && (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false);
              setTimeout(() => setConfirmOpen(true), 150);
            }}
            className={`cursor-pointer ${!isBanned ? "text-red-600" : "text-green-600"}`}
          >
            {!isBanned ? (
              <BanIcon className={`w-4 h-4 mr-2 ${banning ? "opacity-50" : ""}`} />
            ) : (
              <CheckCircle className={`w-4 h-4 mr-2 ${unbanning ? "opacity-50" : ""}`} />
            )}
            {!isBanned
              ? banning
                ? "Banning..."
                : "Ban User"
              : unbanning
              ? "Unbanning..."
              : "Unban User"}
          </DropdownMenuItem>
        )}

        {!isSuperAdmin && isAdminAccount && !isBanned && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-72">
              {Array.isArray(allRoles) && allRoles.length > 0 ? (
                <div className="p-2 space-y-2">
                  <RoleList
                    roles={allRoles}
                    selectedIds={selectedRoleIds}
                    onToggle={(id) =>
                      setSelectedRoleIds((prev) =>
                        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                      )
                    }
                    isDisabled={(r) => r.name === "super_admin"}
                  />
                  <div className="pt-2 flex justify-between gap-2">
                    <Button
                      variant="outline"
                      className="!h-7 px-2 !text-sm cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedRoleIds(Array.isArray(row.roles) ? row.roles.map((r: any) => r.id) : []);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      className="!h-7 px-3 bg-emerald-600 hover:bg-emerald-700 !text-sm cursor-pointer"
                      disabled={assigning}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDropdownOpen(false);
                        setTimeout(() => setConfirmAssignOpen(true), 150);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <DropdownMenuItem disabled className="opacity-60">
                  No roles found
                </DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {isAdminAccount && !isBanned && !isSuperAdmin && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer text-orange-600">
              <UserMinus className="w-4 h-4 mr-2" />
              Remove Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-60">
              {Array.isArray(row.roles) && row.roles.length > 0 ? (
                row.roles.map((r: any) => (
                  <DropdownMenuItem
                    key={r.id}
                    disabled={r.name === "super_admin" || removing}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveRole(r);
                    }}
                    className="cursor-pointer"
                  >
                    <Shield className="w-4 h-4 mr-2" /> {r.title || r.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="opacity-60">
                  No roles to remove
                </DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>

      <UserBanModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setReason("");
        }}
        isBanned={isBanned}
        reason={reason}
        onReasonChange={setReason}
        onConfirm={async () => {
          await handleBanUnban();
          setConfirmOpen(false);
          setReason("");
        }}
        isLoading={banning || unbanning}
      />

      <AssignRolesConfirmModal
        isOpen={confirmAssignOpen}
        onClose={() => setConfirmAssignOpen(false)}
        selectedRoles={selectedRoles}
        onConfirm={handleAssignRoles}
        isLoading={assigning}
      />

      <AssignRolesResultModal
        isOpen={assignResultOpen}
        onClose={() => setAssignResultOpen(false)}
        assignMessage={assignMessage}
        assignResult={assignResult}
      />
    </DropdownMenu>
  );
}
