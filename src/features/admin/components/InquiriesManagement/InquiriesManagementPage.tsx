"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  MoreVertical,
  X,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import { INITIAL_INQUIRIES } from "./data";
import { InquiryDetailModal } from "./InquiryDetailModal";
import type { ContactInquiry, InquiryStatus } from "./types";

const STATUS_BADGES: Record<InquiryStatus, string> = {
  Unread: "bg-red-100 text-red-800 border-red-200",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
  Resolved: "bg-green-100 text-green-800 border-green-200",
  Spam: "bg-gray-100 text-gray-600 border-gray-200",
};

export function InquiriesManagementPage() {
  const [inquiries, setInquiries] =
    useState<ContactInquiry[]>(INITIAL_INQUIRIES);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<ContactInquiry | null>(
    null,
  );

  const totalCount = inquiries.length;
  const unreadCount = inquiries.filter((i) => i.status === "Unread").length;
  const inProgressCount = inquiries.filter(
    (i) => i.status === "In Progress",
  ).length;
  const resolvedCount = inquiries.filter((i) => i.status === "Resolved").length;

  const inquiryStats = [
    {
      label: "Total Inquiries",
      value: totalCount,
      icon: Inbox,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Unread",
      value: unreadCount,
      icon: AlertCircle,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: Clock,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  const filteredInquiries = inquiries.filter((item) => {
    const matchesStatus =
      statusFilter === "all" ||
      item.status.toLowerCase() === statusFilter.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q) ||
      (item.phone && item.phone.includes(q));

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredInquiries.length / pageSize) || 1;
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const hasPagination = filteredInquiries.length > 0;

  const handleOpenDetail = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  const handleStatusChange = (inquiryId: string, status: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status } : i)),
    );
    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
    }
    toast.info(`Ticket status updated to ${status}`);
  };

  const handleSendReply = (inquiryId: string, replyText: string) => {
    const repliedAt = "Just now";
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === inquiryId
          ? {
              ...i,
              status: "Resolved" as InquiryStatus,
              replySent: replyText,
              repliedAt,
            }
          : i,
      ),
    );
  };

  const confirmDeleteInquiry = () => {
    if (!inquiryToDelete) return;
    setInquiries((prev) => prev.filter((i) => i.id !== inquiryToDelete.id));
    toast.success(`Inquiry ticket #${inquiryToDelete.id} removed.`);
    setInquiryToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header — matches garage/booking management */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="whitespace-nowrap text-2xl font-bold tracking-tight text-gray-900">
          Inquiries
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-full cursor-pointer border-gray-300 bg-white text-xs sm:text-sm">
                <SelectValue placeholder="All Inquiries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inquiries</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="block h-11 w-full rounded-lg border border-gray-300 bg-white py-0 pr-9 pl-9 text-xs leading-5 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none sm:w-64 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-1 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {inquiryStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {filteredInquiries.length === 0 ? (
        <div className="flex min-h-100 items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600">No inquiries found</p>
            <p className="mt-2 text-sm text-gray-500">
              Messages will appear here once customers contact you
            </p>
          </div>
        </div>
      ) : (
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
                    Customer
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Subject
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Date
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {paginatedInquiries.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleOpenDetail(item)}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-100 text-xs font-bold text-[#19CA32]">
                          {item.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="min-w-0 max-w-md">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {item.subject}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-gray-500">
                          {item.message}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {item.date}
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[item.status]}`}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>

                    <TableCell
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer text-gray-500 hover:text-gray-900"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 bg-white"
                        >
                          <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
                            Ticket #{item.id}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleOpenDetail(item)}
                            className="flex cursor-pointer items-center gap-2 text-xs"
                          >
                            <Eye size={14} className="text-gray-500" />
                            <span>View Details</span>
                          </DropdownMenuItem>

                          {item.status !== "Resolved" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(item.id, "Resolved")
                              }
                              className="flex cursor-pointer items-center gap-2 text-xs text-green-700 focus:text-green-700"
                            >
                              <CheckCircle2 size={14} />
                              <span>Mark as Resolved</span>
                            </DropdownMenuItem>
                          )}

                          {item.status !== "In Progress" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(item.id, "In Progress")
                              }
                              className="flex cursor-pointer items-center gap-2 text-xs"
                            >
                              <Clock size={14} className="text-gray-500" />
                              <span>Mark In Progress</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => setInquiryToDelete(item)}
                            className="flex cursor-pointer items-center gap-2 text-xs text-red-600 focus:bg-red-50 focus:text-red-600"
                          >
                            <Trash2 size={14} />
                            <span>Delete Ticket</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            totalItems={filteredInquiries.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setPageSize(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <InquiryDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        inquiry={selectedInquiry}
        onStatusChange={handleStatusChange}
        onSendReply={handleSendReply}
      />

      <ConfirmationModal
        open={!!inquiryToDelete}
        onClose={() => setInquiryToDelete(null)}
        onConfirm={confirmDeleteInquiry}
        title={`Delete Inquiry Ticket #${inquiryToDelete?.id || ""}?`}
        description="This will remove this customer message and its history from the admin console."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
