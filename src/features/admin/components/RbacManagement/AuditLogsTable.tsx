"use client";

import { useState, useEffect } from "react";
import { Clock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import type { RbacAuditLog } from "./types";

interface AuditLogsTableProps {
  logs: RbacAuditLog[];
  searchQuery: string;
  statusFilter: string;
}

export function AuditLogsTable({
  logs,
  searchQuery,
  statusFilter,
}: AuditLogsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredLogs = logs.filter((log) => {
    const matchesStatus =
      statusFilter === "all" || log.status === statusFilter;
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
  const hasPagination = filteredLogs.length > 0;

  if (filteredLogs.length === 0) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No audit entries found</p>
          <p className="mt-2 text-sm text-gray-500">
            Adjust your filters or search query
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
                Timestamp
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Administrator / Actor
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Action Performed
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Target Resource
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Details & Remarks
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Client IP
              </TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                Result
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-200">
            {paginatedLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-gray-50">
                <TableCell className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  <div className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="shrink-0 text-[#19CA32]" />
                    <span>{log.timestamp}</span>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {log.actorName}
                  </div>
                  <div className="text-xs text-gray-500">{log.actorEmail}</div>
                </TableCell>

                <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">
                  {log.action}
                </TableCell>

                <TableCell className="px-6 py-4 font-mono text-sm text-gray-700">
                  {log.resource}
                </TableCell>

                <TableCell className="max-w-xs px-6 py-4 text-sm text-gray-500">
                  {log.details}
                </TableCell>

                <TableCell className="px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-500">
                  <div className="inline-flex items-center gap-1.5">
                    <Globe size={13} className="shrink-0 text-gray-400" />
                    <span>{log.ip}</span>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-4 text-right">
                  <Badge
                    variant="outline"
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      log.status === "Success"
                        ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                        : log.status === "Warning"
                          ? "border-amber-200 bg-amber-100 text-amber-800"
                          : "border-rose-200 bg-rose-100 text-rose-800"
                    }`}
                  >
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ReusablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={pageSize}
        totalItems={filteredLogs.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(limit) => {
          setPageSize(limit);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
