"use client";

import React from "react";
import { InvoiceList } from "@/features/garage/components/invoices";

export default function InvoicesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">List of All Invoices</h1>
      </div>
      <InvoiceList />
    </div>
  );
}
