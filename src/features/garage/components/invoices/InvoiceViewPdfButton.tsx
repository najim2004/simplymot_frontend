"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import type { Invoice } from "@/features/garage";

interface InvoiceViewPdfButtonProps {
  row: Invoice;
  isGenerating: boolean;
  onClick: (row: Invoice) => void;
}

export default function InvoiceViewPdfButton({
  row,
  isGenerating,
  onClick,
}: InvoiceViewPdfButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex cursor-pointer items-center gap-1.5 text-[#19CA32] hover:text-[#15b02b] font-semibold text-xs"
      onClick={() => onClick(row)}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Opening PDF...</span>
        </>
      ) : (
        <>
          <ExternalLink className="h-3.5 w-3.5" />
          <span>View PDF</span>
        </>
      )}
    </Button>
  );
}
