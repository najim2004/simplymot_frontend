export type InquiryStatus = "Unread" | "In Progress" | "Resolved" | "Spam";

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: InquiryStatus;
  replySent?: string;
  repliedAt?: string;
}