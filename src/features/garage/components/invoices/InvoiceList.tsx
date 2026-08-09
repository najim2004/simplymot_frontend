"use client";

import React, { useState, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  useGetInvoicesQuery,
  useLazyGetInvoiceByIdQuery,
  type Invoice,
} from "@/features/garage";
import { toast } from "react-toastify";
import { useDebounce } from "@/hooks/useDebounce";
import InvoiceSearchBar from "./InvoiceSearchBar";
import InvoiceEmptyState from "./InvoiceEmptyState";
import InvoiceViewPdfButton from "./InvoiceViewPdfButton";
import { INVOICE_COLUMNS } from "./invoice-list.helpers";

export default function InvoiceList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const {
    data: invoicesData,
    isLoading,
    error,
  } = useGetInvoicesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
  });

  const [fetchInvoiceById] = useLazyGetInvoiceByIdQuery();

  const handleOpenPdf = async (row: Invoice) => {
    if (!row?.id) return;
    setLoadingInvoiceId(row.id);
    try {
      const result = await fetchInvoiceById(row.id).unwrap();
      const invoiceDetail = result?.data;
      if (!invoiceDetail) {
        toast.error("Failed to load invoice details");
        return;
      }
      const { pdf } = await import("@react-pdf/renderer");
      const { default: InvoicePdfDocument } =
        await import("../InvoicePdfDocument");
      const blob = await pdf(
        <InvoicePdfDocument invoice={invoiceDetail} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      if (!tab)
        toast.error("Pop-up blocked! Please allow pop-ups to view PDF.");
      else toast.success("Invoice PDF opened in new tab");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : null;
      toast.error(msg || "Failed to generate invoice PDF");
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  const actions = [
    {
      label: "View PDF",
      render: (row: Invoice) => (
        <InvoiceViewPdfButton
          row={row}
          isGenerating={loadingInvoiceId === row.id}
          onClick={handleOpenPdf}
        />
      ),
    },
  ];

  const invoices = invoicesData?.data || [];
  const metaData = invoicesData?.meta_data;
  const meta = {
    total: metaData?.total ?? invoices.length,
    page: metaData?.page ?? 1,
    limit: metaData?.limit ?? 10,
    totalPages: metaData?.pages ?? 1,
  };

  return (
    <div>
      <InvoiceSearchBar value={searchTerm} onChange={setSearchTerm} />

      {error && !isLoading && <InvoiceEmptyState type="error" />}

      {!isLoading && !error && invoices.length === 0 && !searchTerm && (
        <InvoiceEmptyState type="empty" />
      )}

      {!isLoading && !error && invoices.length === 0 && searchTerm && (
        <InvoiceEmptyState type="no-results" />
      )}

      {(isLoading || (!error && invoices.length > 0)) && (
        <>
          <ReusableTable
            data={invoices}
            columns={INVOICE_COLUMNS}
            actions={actions}
            isLoading={isLoading}
            skeletonRows={itemsPerPage}
          />
          {!isLoading && (
            <ReusablePagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              itemsPerPage={meta.limit}
              totalItems={meta.total}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
