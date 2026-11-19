import type { LucideIcon } from "lucide-react";

export type PermissionKey =
  // Bookings module
  | "bookings:view"
  | "bookings:create"
  | "bookings:update_status"
  | "bookings:cancel_refund"
  | "bookings:assign_garage"
  | "bookings:export"
  // Vehicles module
  | "vehicles:view"
  | "vehicles:create"
  | "vehicles:edit"
  | "vehicles:delete"
  | "vehicles:reminders"
  | "vehicles:adjust"
  // Customers module
  | "customers:view"
  | "customers:edit"
  | "customers:email_promo"
  | "customers:suspend"
  | "customers:export"
  // Analytics module
  | "analytics:view_dashboard"
  | "analytics:revenue_reports"
  | "analytics:export_financials"
  // Staff & RBAC module
  | "rbac:view_staff"
  | "rbac:invite_staff"
  | "rbac:manage_roles"
  | "rbac:audit_logs"
  // Settings module
  | "settings:general"
  | "settings:payments"
  | "settings:shipping_gateways";

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  permissions: PermissionDefinition[];
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  color: string;
  badgeBg: string;
  isSystem: boolean; // System roles cannot be deleted
  usersCount: number;
  permissions: PermissionKey[];
}

export type StaffStatus = "Active" | "Inactive" | "Invited";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  roleName: string;
  department: string;
  status: StaffStatus;
  lastLogin: string;
  createdAt: string;
  phone?: string;
}

export interface RbacAuditLog {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ip: string;
  status: "Success" | "Warning" | "Failed";
}


export interface InviteCandidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
}
