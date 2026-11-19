"use client";

import { useState, useEffect } from "react";
import {
  MoreVertical,
  ShieldCheck,
  UserCheck,
  UserX,
  Lock,
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import type { StaffMember, RoleItem } from "./types";

interface StaffTableProps {
  staffList: StaffMember[];
  roles: RoleItem[];
  searchQuery: string;
  roleFilter: string;
  onViewStaff: (staff: StaffMember) => void;
  onToggleStaffStatus: (staff: StaffMember) => void;
  onChangeStaffRole: (staff: StaffMember, roleId: string) => void;
  onRemoveStaff: (staff: StaffMember) => void;
}

export function StaffTable({
  staffList,
  roles,
  searchQuery,
  roleFilter,
  onViewStaff,
  onToggleStaffStatus,
  onChangeStaffRole,
  onRemoveStaff,
}: StaffTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const filteredStaff = staffList.filter((s) => {
    const matchesRole = roleFilter === "all" || s.roleId === roleFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.department.toLowerCase().includes(query) ||
      s.roleName.toLowerCase().includes(query);

    return matchesRole && matchesSearch;
  });

  const totalPages = Math.ceil(filteredStaff.length / pageSize) || 1;
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const hasPagination = filteredStaff.length > 0;

  if (filteredStaff.length === 0) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No team members found</p>
          <p className="mt-2 text-sm text-gray-500">
            Adjust your filters or invite a new staff member
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`overflow-x-auto border border-gray-300 bg-white ${
          hasPagination ? "rounded-t-lg" : "rounded-lg"
        }`}
      >
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Staff Member
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Assigned Role
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Department
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Last Active
              </TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-200">
            {paginatedStaff.map((staff) => {
              const roleObj = roles.find((r) => r.id === staff.roleId);

              return (
                <TableRow key={staff.id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#DDF7E0] text-xs font-bold text-[#19CA32]">
                        {staff.avatar || staff.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {staff.name}
                        </div>
                        <div className="text-xs text-gray-500">{staff.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                        roleObj?.badgeBg ||
                        "border-zinc-200 bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {staff.roleName}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm text-gray-500">
                    {staff.department}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        staff.status === "Active"
                          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                          : staff.status === "Invited"
                            ? "border-blue-200 bg-blue-100 text-blue-800"
                            : "border-gray-200 bg-gray-100 text-gray-600"
                      }`}
                    >
                      {staff.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {staff.lastLogin}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer text-gray-500 hover:text-gray-900"
                        >
                          <MoreVertical size={16} />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-white"
                      >
                        <DropdownMenuLabel className="text-xs text-gray-500">
                          Manage {staff.name}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onViewStaff(staff)}
                          className="cursor-pointer text-xs font-medium"
                        >
                          <Eye size={14} className="mr-2" />
                          View User
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(staff.email);
                            toast.success("Email copied to clipboard");
                          }}
                          className="cursor-pointer text-xs font-medium"
                        >
                          <Copy size={14} className="mr-2" />
                          Copy Email
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <div className="px-2 py-1 text-[11px] font-semibold text-gray-500 uppercase">
                          Change Role to:
                        </div>
                        {roles.map((r) => (
                          <DropdownMenuItem
                            key={r.id}
                            disabled={r.id === staff.roleId}
                            onClick={() => onChangeStaffRole(staff, r.id)}
                            className="cursor-pointer text-xs"
                          >
                            <ShieldCheck
                              size={13}
                              className="mr-1.5 text-gray-500"
                            />
                            {r.name}
                          </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onToggleStaffStatus(staff)}
                          className="cursor-pointer text-xs"
                        >
                          {staff.status === "Active" ? (
                            <>
                              <UserX
                                size={13}
                                className="mr-1.5 text-amber-600"
                              />
                              <span className="font-medium text-amber-800">
                                Deactivate Account
                              </span>
                            </>
                          ) : (
                            <>
                              <UserCheck
                                size={13}
                                className="mr-1.5 text-emerald-600"
                              />
                              <span className="font-medium text-emerald-700">
                                Activate Account
                              </span>
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onRemoveStaff(staff)}
                          className="cursor-pointer text-xs text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                        >
                          <Lock size={13} className="mr-1.5 text-rose-600" />
                          <span>Revoke Access</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ReusablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={pageSize}
        totalItems={filteredStaff.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(limit) => {
          setPageSize(limit);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
