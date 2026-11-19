"use client";

import React, { useState } from "react";
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
  Trash2,
  UserCog,
} from "lucide-react";
import {
  useBanUserMutation,
  useUnbanUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/features/admin";
import { toast } from "sonner";
import UserBanModal from "./UserBanModal";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";

const KIND_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "GARAGE", label: "Garage" },
  { value: "DRIVER", label: "Customer/Driver" },
] as const;

interface TableActionProps {
  row: any;
}

function getUserKind(row: any): string {
  return String(row?.kind || row?.type || "").toUpperCase();
}

function getUserStatus(row: any): string {
  return String(row?.status || "").toUpperCase();
}

export default function TableAction({ row }: TableActionProps) {
  const router = useRouter();
  const [banUser, { isLoading: banning }] = useBanUserMutation();
  const [unbanUser, { isLoading: unbanning }] = useUnbanUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: updatingKind }] = useUpdateUserMutation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reason, setReason] = useState("");

  const kind = getUserKind(row);
  const status = getUserStatus(row);
  const isBanned = status === "BANNED";
  const canBan = status === "ACTIVE" || status === "PENDING" || status === "APPROVED";

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

  const handleChangeKind = async (nextKind: string) => {
    if (nextKind === kind) return;
    try {
      const res = await updateUser({
        id: row.id,
        type: nextKind,
        kind: nextKind,
      } as any).unwrap();
      if ((res as any)?.success === false) {
        toast.error((res as any)?.message || "Failed to update kind");
      } else {
        toast.success(`User kind updated to ${KIND_OPTIONS.find((k) => k.value === nextKind)?.label || nextKind}`);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to update kind");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteUser(row.id).unwrap();
      if ((res as any)?.success === false) {
        toast.error((res as any)?.message || "Failed to delete user");
      } else {
        toast.success("User deleted successfully");
      }
      setDeleteModalOpen(false);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to delete user");
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="cursor-pointer rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 bg-white"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={() => setDropdownOpen(false)}
        >
          <DropdownMenuItem
            className="cursor-pointer text-xs font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false);
              setTimeout(
                () => router.push(`/admin/users-management/${row.id}`),
                150,
              );
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer text-xs font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false);
              setTimeout(
                () =>
                  router.push(`/admin/users-management/${row.id}?edit=true`),
                150,
              );
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer text-xs font-medium">
              <UserCog className="mr-2 h-4 w-4" />
              Change Kind To
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48 bg-white">
              {KIND_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  disabled={option.value === kind || updatingKind}
                  className="cursor-pointer text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropdownOpen(false);
                    setTimeout(() => handleChangeKind(option.value), 150);
                  }}
                >
                  {option.label}
                  {option.value === kind && (
                    <span className="ml-auto text-[10px] text-gray-400">
                      Current
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {(canBan || isBanned) && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropdownOpen(false);
                setTimeout(() => setBanModalOpen(true), 150);
              }}
              className={`cursor-pointer text-xs font-medium ${
                !isBanned ? "text-red-600" : "text-green-600"
              }`}
            >
              {!isBanned ? (
                <BanIcon
                  className={`mr-2 h-4 w-4 ${banning ? "opacity-50" : ""}`}
                />
              ) : (
                <CheckCircle
                  className={`mr-2 h-4 w-4 ${unbanning ? "opacity-50" : ""}`}
                />
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

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false);
              setTimeout(() => setDeleteModalOpen(true), 150);
            }}
            className="cursor-pointer text-xs font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserBanModal
        isOpen={banModalOpen}
        onClose={() => {
          setBanModalOpen(false);
          setReason("");
        }}
        isBanned={isBanned}
        reason={reason}
        onReasonChange={setReason}
        onConfirm={async () => {
          await handleBanUnban();
          setBanModalOpen(false);
          setReason("");
        }}
        isLoading={banning || unbanning}
      />

      <ConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${row.name || "User"}"?`}
        description="This will soft-delete the user account. Related records may also be affected."
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </>
  );
}
