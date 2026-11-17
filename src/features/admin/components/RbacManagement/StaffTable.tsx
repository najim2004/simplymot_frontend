"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  ShieldCheck,
  UserCheck,
  UserX,
  Lock,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StaffMember, RoleItem } from "./types";

interface StaffTableProps {
  staffList: StaffMember[];
  roles: RoleItem[];
  onOpenInviteDialog: () => void;
  onToggleStaffStatus: (staff: StaffMember) => void;
  onChangeStaffRole: (staff: StaffMember, roleId: string) => void;
  onRemoveStaff: (staff: StaffMember) => void;
}

export function StaffTable({
  staffList,
  roles,
  onOpenInviteDialog,
  onToggleStaffStatus,
  onChangeStaffRole,
  onRemoveStaff,
}: StaffTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredStaff = staffList.filter((s) => {
    const matchesRole = roleFilter === "All" || s.roleId === roleFilter;
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

  const startItem =
    filteredStaff.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredStaff.length);

  return (
    <div className="space-y-0">
      {/* Table Filter & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
        {/* Search */}
        <div className="relative min-w-64 flex-1">
          <Search
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search by staff name, email, department..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-md pl-9 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>

        {/* Filter by Role & Export Button */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-48 rounded-md border-gray-200 bg-white text-sm font-medium text-gray-900 focus:ring-[#19CA32]/20">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="All" className="text-xs">
                All Roles ({staffList.length})
              </SelectItem>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id} className="text-xs">
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md border-gray-200 text-sm font-medium hover:bg-green-50"
          >
            <Download size={14} className="mr-1.5" /> Export Team
          </Button>

          <Button
            size="sm"
            onClick={onOpenInviteDialog}
            className="h-10 cursor-pointer rounded-md bg-[#19CA32] text-sm font-semibold text-white shadow-xs hover:bg-green-600"
          >
            <UserPlus size={14} className="mr-1.5" /> Add Staff
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="border-gray-100 hover:bg-transparent">
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Staff Member
            </TableHead>
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Assigned Role
            </TableHead>
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Department
            </TableHead>
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Status
            </TableHead>
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Last Active
            </TableHead>
            <TableHead className="px-4 py-3.5 text-right text-xs font-semibold tracking-wider uppercase text-gray-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100">
          {paginatedStaff.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-sm text-gray-500"
              >
                No team members found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            paginatedStaff.map((staff) => {
              const roleObj = roles.find((r) => r.id === staff.roleId);

              return (
                <TableRow
                  key={staff.id}
                  className="border-gray-100 transition-colors hover:bg-green-50/40"
                >
                  {/* Member Name + Avatar */}
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#DDF7E0] text-xs font-bold text-[#19CA32]">
                        {staff.avatar || staff.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {staff.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {staff.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Assigned Role */}
                  <TableCell className="px-4 py-3.5">
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

                  {/* Department */}
                  <TableCell className="px-4 py-3.5 text-sm text-gray-500">
                    {staff.department}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-4 py-3.5">
                    <Badge
                      variant="outline"
                      className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                        staff.status === "Active"
                          ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                          : staff.status === "Invited"
                            ? "border-blue-200/80 bg-blue-50 text-blue-700"
                            : "border-zinc-200/80 bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {staff.status}
                    </Badge>
                  </TableCell>

                  {/* Last Login */}
                  <TableCell className="px-4 py-3.5 text-sm text-gray-500">
                    {staff.lastLogin}
                  </TableCell>

                  {/* 3-Dot Dropdown Actions */}
                  <TableCell className="px-4 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          title="Actions"
                          className="rounded-md p-1.5 text-gray-500 outline-hidden transition-colors hover:bg-green-50 hover:text-gray-900"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-white"
                      >
                        <DropdownMenuLabel className="text-xs text-gray-500">
                          Manage {staff.name}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Change Role */}
                        <div className="px-2 py-1 text-[11px] font-semibold uppercase text-gray-500">
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

                        {/* Toggle Status */}
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

                        {/* Remove Access */}
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
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 p-4 text-xs text-gray-500">
        <div>
          Showing <span className="font-medium text-gray-900">{startItem}</span> to{" "}
          <span className="font-medium text-gray-900">{endItem}</span> of{" "}
          <span className="font-medium text-gray-900">{filteredStaff.length}</span>{" "}
          staff members
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-18 rounded-md border-gray-200 bg-white text-xs text-gray-900 focus:ring-[#19CA32]/20">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent align="end">
                {[5, 10, 20].map((size) => (
                  <SelectItem
                    key={size}
                    value={String(size)}
                    className="text-xs"
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-md border-gray-200 p-0 hover:bg-green-50 disabled:opacity-40"
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-md border-gray-200 p-0 hover:bg-green-50 disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 min-w-8 cursor-pointer rounded-md px-2.5 text-xs font-medium transition-colors ${
                  currentPage === page
                    ? "bg-[#19CA32] font-semibold text-white shadow-xs"
                    : "border border-gray-200 text-gray-500 hover:bg-green-50 hover:text-gray-900"
                }`}
              >
                {page}
              </button>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="h-8 w-8 rounded-md border-gray-200 p-0 hover:bg-green-50 disabled:opacity-40"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="h-8 w-8 rounded-md border-gray-200 p-0 hover:bg-green-50 disabled:opacity-40"
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
