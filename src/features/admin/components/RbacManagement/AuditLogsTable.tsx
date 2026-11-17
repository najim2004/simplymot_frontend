"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { RbacAuditLog } from "./types";

interface AuditLogsTableProps {
  logs: RbacAuditLog[];
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === "All" || log.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      log.actorName.toLowerCase().includes(query) ||
      log.actorEmail.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.resource.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.ip.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const startItem =
    filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredLogs.length);

  return (
    <div className="space-y-0">
      {/* Search & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
        <div className="relative min-w-64 flex-1">
          <Search
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search audit trail by actor, action, resource, or IP..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-md pl-9 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-36 rounded-md border-gray-200 bg-white text-sm font-medium text-gray-900 focus:ring-[#19CA32]/20">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="All" className="text-xs">
                All Statuses
              </SelectItem>
              <SelectItem value="Success" className="text-xs text-emerald-700">
                Success
              </SelectItem>
              <SelectItem value="Warning" className="text-xs text-amber-700">
                Warning
              </SelectItem>
              <SelectItem value="Failed" className="text-xs text-rose-700">
                Failed
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md border-gray-200 text-sm font-medium hover:bg-green-50"
          >
            <Download size={14} className="mr-1.5" /> Export Logs
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="border-gray-100 hover:bg-transparent">
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Timestamp
            </TableHead>
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Administrator / Actor
            </TableHead>
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Action Performed
            </TableHead>
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Target Resource
            </TableHead>
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Details & Remarks
            </TableHead>
            <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Client IP
            </TableHead>
            <TableHead className="px-4 py-3.5 text-right text-xs font-semibold tracking-wider uppercase text-gray-500">
              Result
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100">
          {paginatedLogs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-sm text-gray-500"
              >
                No audit entries match your search query.
              </TableCell>
            </TableRow>
          ) : (
            paginatedLogs.map((log) => (
              <TableRow
                key={log.id}
                className="border-gray-100 transition-colors hover:bg-green-50/40"
              >
                <TableCell className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="shrink-0 text-[#19CA32]" />
                    <span>{log.timestamp}</span>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3.5">
                  <div className="text-sm font-medium text-gray-900">
                    {log.actorName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {log.actorEmail}
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3.5 text-sm font-medium text-gray-900">
                  {log.action}
                </TableCell>

                <TableCell className="font-mono text-sm text-gray-700 px-4 py-3.5">
                  {log.resource}
                </TableCell>

                <TableCell className="max-w-xs px-4 py-3.5 text-sm text-gray-500">
                  {log.details}
                </TableCell>

                <TableCell className="px-4 py-3.5 font-mono text-sm text-gray-500 whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <Globe size={13} className="shrink-0 text-gray-400" />
                    <span>{log.ip}</span>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3.5 text-right">
                  <Badge
                    variant="outline"
                    className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                      log.status === "Success"
                        ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                        : log.status === "Warning"
                          ? "border-amber-200/80 bg-amber-50 text-amber-800"
                          : "border-rose-200/80 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 p-4 text-xs text-gray-500">
        <div>
          Showing <span className="font-medium text-gray-900">{startItem}</span> to{" "}
          <span className="font-medium text-gray-900">{endItem}</span> of{" "}
          <span className="font-medium text-gray-900">{filteredLogs.length}</span>{" "}
          entries
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
