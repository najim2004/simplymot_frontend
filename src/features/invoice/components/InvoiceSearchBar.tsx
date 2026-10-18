"use client";

import React from "react";
import { Search } from "lucide-react";

interface InvoiceSearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function InvoiceSearchBar({ value, onChange }: InvoiceSearchBarProps) {
  return (
    <div className="flex justify-end mb-4">
      <div className="relative w-full sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search invoices..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:border-transparent text-sm"
        />
      </div>
    </div>
  );
}
