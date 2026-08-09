// Shared customer/garage types (list response - minimal)
export interface InvoiceCustomerSummary {
  id: string;
  name: string | null;
  email: string | null;
}

export interface InvoiceGarageSummary {
  id: string;
  garage_name: string | null;
}

// Detail-only additional fields
export interface InvoiceCustomerDetail extends InvoiceCustomerSummary {
  phone_number?: string | null;
  address?: string | null;
}

export interface InvoiceGarageDetail extends InvoiceGarageSummary {
  contact_email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  post_code?: string | null;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface InvoiceTransaction {
  id: string;
  kind: string;
  provider: string;
  reference_number?: string | null;
  status: string;
  amount: number;
  currency: string;
  paid_amount: number;
  paid_currency: string;
  created_at: string;
}

// List invoice item (from GET /api/invoice)
export interface Invoice {
  id: string;
  invoice_number: string;
  kind: string;
  status: "PAID" | "PENDING" | "OVERDUE" | string;
  currency: string;
  total_amount: number | string;
  due_amount: number | string;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  created_at: string;
  customer: InvoiceCustomerSummary;
  garage: InvoiceGarageSummary;
}

// Detailed invoice (from GET /api/invoice/:id)
export interface InvoiceDetail {
  id: string;
  invoice_number: string;
  kind: string;
  status: "PAID" | "PENDING" | "OVERDUE" | string;
  currency: string;
  total_amount: number;
  due_amount: number;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  created_at: string;
  customer: InvoiceCustomerDetail;
  garage: InvoiceGarageDetail;
  items: InvoiceItem[];
  transactions: InvoiceTransaction[];
}

export interface InvoiceMetaData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface InvoicesResponse {
  success: boolean;
  message: string;
  data: Invoice[];
  meta_data?: InvoiceMetaData;
}

export interface DetailedInvoiceResponse {
  success: boolean;
  message?: string;
  data?: InvoiceDetail;
}
