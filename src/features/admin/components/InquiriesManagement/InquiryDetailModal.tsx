"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Send,
  CheckCircle2,
  Phone,
  CornerDownRight,
  Inbox,
} from "lucide-react";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContactInquiry, InquiryStatus } from "./types";
import { toast } from "sonner";

interface InquiryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: ContactInquiry | null;
  onStatusChange: (inquiryId: string, status: InquiryStatus) => void;
  onSendReply: (inquiryId: string, replyText: string) => void;
}

const STATUS_BADGES: Record<InquiryStatus, string> = {
  Unread: "bg-red-100 text-red-800 border-red-200",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
  Resolved: "bg-green-100 text-green-800 border-green-200",
  Spam: "bg-gray-100 text-gray-600 border-gray-200",
};

export function InquiryDetailModal({
  open,
  onOpenChange,
  inquiry,
  onStatusChange,
  onSendReply,
}: InquiryDetailModalProps) {
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open) setReplyText("");
  }, [open, inquiry?.id]);

  if (!inquiry) return null;

  const handleClose = () => {
    if (isSending) return;
    setReplyText("");
    onOpenChange(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error("Please enter a reply message before sending");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      onSendReply(inquiry.id, replyText.trim());
      setIsSending(false);
      setReplyText("");
      toast.success(`Response emailed to ${inquiry.email}!`);
      onOpenChange(false);
    }, 400);
  };

  return (
    <CustomReusableModal
      isOpen={open}
      onClose={handleClose}
      title={inquiry.subject}
      showHeader={false}
      hideClose={true}
      className="flex max-w-2xl flex-col"
      contentClassName="flex min-h-0 flex-col overflow-hidden p-0"
    >
      <div className="flex max-h-[90vh] min-h-0 flex-col overflow-hidden rounded-lg bg-white">
        <div className="flex shrink-0 items-center justify-between bg-linear-to-r from-[#19CA32] to-[#16b82e] px-5 py-4 text-white shadow-md">
          <div className="min-w-0 pr-3">
            <h2 className="truncate text-lg font-semibold">{inquiry.subject}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/90">
              <span className="font-mono">Ticket #{inquiry.id}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> {inquiry.date}
              </span>
            </p>
          </div>
          <Inbox className="h-5 w-5 shrink-0 opacity-90" />
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-100 text-xs font-bold text-[#19CA32]">
                {inquiry.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {inquiry.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="transition hover:text-[#19CA32] hover:underline"
                  >
                    {inquiry.email}
                  </a>
                  {inquiry.phone && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-mono text-gray-600">
                        <Phone size={11} className="shrink-0 text-[#19CA32]" />
                        {inquiry.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[inquiry.status]}`}
            >
              {inquiry.status}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Inquiry Status
            </Label>
            <Select
              value={inquiry.status}
              onValueChange={(val) =>
                onStatusChange(inquiry.id, val as InquiryStatus)
              }
            >
              <SelectTrigger className="h-11 w-full border-gray-300 bg-white text-sm focus:ring-[#19CA32]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Unread">Unread</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Customer Message
            </span>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
              {inquiry.message}
            </div>
          </div>

          {inquiry.replySent && (
            <div className="space-y-1 rounded-xl border border-green-200 bg-green-50/60 p-3.5 text-sm">
              <div className="flex items-center justify-between font-semibold text-green-800">
                <span className="inline-flex items-center gap-1.5">
                  <CornerDownRight size={13} /> Support Response Sent
                </span>
                <span className="text-xs font-normal text-green-700">
                  {inquiry.repliedAt}
                </span>
              </div>
              <p className="pt-0.5 pl-4 leading-relaxed text-green-950">
                {inquiry.replySent}
              </p>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Reply Message
              </Label>
              <Textarea
                rows={3}
                placeholder={`Write a response to ${inquiry.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="h-20 resize-none rounded-lg border-gray-300 text-sm focus-visible:ring-[#19CA32]/20"
              />
              <p className="text-xs text-gray-500">
                Sending from:{" "}
                <span className="font-medium text-gray-700">
                  support@simplymot.com
                </span>
              </p>
            </div>

            <div
              className={`grid gap-3 border-t border-gray-200 pt-3 ${
                inquiry.status !== "Resolved" ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
              <Button
                type="submit"
                disabled={isSending}
                className="h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#19CA32] to-[#16b82e] font-semibold text-white shadow-md hover:opacity-95"
              >
                <Send size={14} className="mr-1.5" />
                {isSending ? "Sending..." : "Send Reply"}
              </Button>
              {inquiry.status !== "Resolved" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onStatusChange(inquiry.id, "Resolved");
                    toast.success(
                      `Inquiry #${inquiry.id} marked as Resolved!`,
                    );
                    handleClose();
                  }}
                  className="h-11 cursor-pointer rounded-lg font-semibold text-green-700 hover:border-green-300 hover:bg-green-50"
                >
                  <CheckCircle2 size={14} className="mr-1.5" /> Mark Resolved
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSending}
                className="h-11 cursor-pointer rounded-lg font-semibold"
              >
                Close
              </Button>
            </div>
          </form>
        </div>
      </div>
    </CustomReusableModal>
  );
}
