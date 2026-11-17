import {
  CalendarCheck,
  Car,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import type {
  PermissionGroup,
  RoleItem,
  StaffMember,
  RbacAuditLog,
  RbacStat,
  PermissionKey,
  InviteCandidate,
} from "./types";

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "bookings",
    name: "Bookings & Scheduling",
    description:
      "Access MOT and service bookings, update statuses, and handle refunds",
    icon: CalendarCheck,
    permissions: [
      {
        key: "bookings:view",
        label: "View Bookings List",
        description: "Browse all upcoming, active, and completed bookings",
      },
      {
        key: "bookings:create",
        label: "Create Manual Bookings",
        description: "Place telephone or partner-garage bookings on behalf of customers",
      },
      {
        key: "bookings:update_status",
        label: "Update Booking Status",
        description: "Transition bookings across Confirmed, In Progress, Completed",
      },
      {
        key: "bookings:cancel_refund",
        label: "Cancel & Issue Refunds",
        description: "Approve booking cancellations and process cash refunds",
      },
      {
        key: "bookings:assign_garage",
        label: "Assign Garage Partner",
        description: "Select MOT garage partners and reschedule inspection slots",
      },
      {
        key: "bookings:export",
        label: "Export Booking Data",
        description: "Download CSV / Excel spreadsheets of booking entries",
      },
    ],
  },
  {
    id: "vehicles",
    name: "Vehicles & Reminders",
    description:
      "Manage vehicle records, MOT expiry data, reminders, and class types",
    icon: Car,
    permissions: [
      {
        key: "vehicles:view",
        label: "View Vehicle Records",
        description: "See all registered vehicles, reg marks, and MOT history",
      },
      {
        key: "vehicles:create",
        label: "Add Vehicle Records",
        description: "Register new vehicles with V5C details and mileage data",
      },
      {
        key: "vehicles:edit",
        label: "Edit Vehicle Details",
        description: "Modify registration dates, mileage, and service notes",
      },
      {
        key: "vehicles:delete",
        label: "Delete / Archive Vehicles",
        description: "Permanently delete or hide vehicle records from the platform",
      },
      {
        key: "vehicles:reminders",
        label: "Manage MOT Reminders",
        description: "Configure automated SMS and email MOT expiry reminders",
      },
      {
        key: "vehicles:adjust",
        label: "Direct Record Correction",
        description: "Manually correct DVSA sync mismatches in vehicle records",
      },
    ],
  },
  {
    id: "customers",
    name: "Customer CRM",
    description:
      "Manage driver and garage accounts, communicate promos, and handle fraud flags",
    icon: Users,
    permissions: [
      {
        key: "customers:view",
        label: "View Customer Profiles",
        description: "Access customer lists, contact info, and lifetime metrics",
      },
      {
        key: "customers:edit",
        label: "Edit Customer Details",
        description: "Update addresses, names, and phone records",
      },
      {
        key: "customers:email_promo",
        label: "Broadcast Promotional Emails",
        description: "Send discount vouchers and mass promotional campaigns",
      },
      {
        key: "customers:suspend",
        label: "Suspend / Block Accounts",
        description: "Freeze or ban fraudulent driver and garage profiles",
      },
      {
        key: "customers:export",
        label: "Export Customer Records",
        description: "Download complete customer CRM contacts to CSV",
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics & Financials",
    description:
      "Business intelligence reports, booking trends, and commission summaries",
    icon: BarChart3,
    permissions: [
      {
        key: "analytics:view_dashboard",
        label: "View Executive Dashboard",
        description: "Monitor live booking volume, revenue, and conversion rates",
      },
      {
        key: "analytics:revenue_reports",
        label: "Generate Revenue Reports",
        description: "Analyse garage commissions, average booking value, and refunds",
      },
      {
        key: "analytics:export_financials",
        label: "Export Accounting Books",
        description: "Download monthly financial ledgers and settlement data",
      },
    ],
  },
  {
    id: "rbac",
    name: "Staff & Security (RBAC)",
    description:
      "Control administrator accounts, role privileges, and audit trails",
    icon: ShieldCheck,
    permissions: [
      {
        key: "rbac:view_staff",
        label: "View Team Directory",
        description: "Inspect team members, assigned departments, and roles",
      },
      {
        key: "rbac:invite_staff",
        label: "Invite New Staff Members",
        description: "Send administrator portal invitations to colleagues",
      },
      {
        key: "rbac:manage_roles",
        label: "Configure Role Permissions",
        description: "Create roles and toggle granular privilege switches",
      },
      {
        key: "rbac:audit_logs",
        label: "Inspect Security Audit Logs",
        description:
          "Audit timestamps, IP addresses, and actions taken by staff",
      },
    ],
  },
  {
    id: "settings",
    name: "Platform Configuration",
    description:
      "Global settings, payment gateways, and partner integrations",
    icon: Settings,
    permissions: [
      {
        key: "settings:general",
        label: "General Platform Info",
        description: "Configure platform currency, contact numbers, and branding",
      },
      {
        key: "settings:payments",
        label: "Payment Gateways",
        description: "Connect Stripe, GoCardless, and PayPal APIs",
      },
      {
        key: "settings:shipping_gateways",
        label: "Garage Partner Rates",
        description: "Define commission tiers, slot fees, and partner API keys",
      },
    ],
  },
];

// All permission keys flat
export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_GROUPS.flatMap(
  (g) => g.permissions.map((p) => p.key),
);

export const DEFAULT_ROLES: RoleItem[] = [
  {
    id: "super-admin",
    name: "Super Administrator",
    description:
      "Unrestricted master access to all platform systems, financials, and staff controls",
    color: "text-purple-700 border-purple-300 bg-purple-50",
    badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
    isSystem: true,
    usersCount: 2,
    permissions: [...ALL_PERMISSION_KEYS],
  },
  {
    id: "operations-manager",
    name: "Marketplace Operations Manager",
    description:
      "Manages daily operations, garage partners, bookings, customer CRM, and reporting",
    color: "text-blue-700 border-blue-300 bg-blue-50",
    badgeBg: "bg-blue-100 text-blue-900 border-blue-300",
    isSystem: true,
    usersCount: 3,
    permissions: [
      "bookings:view",
      "bookings:create",
      "bookings:update_status",
      "bookings:cancel_refund",
      "bookings:assign_garage",
      "bookings:export",
      "vehicles:view",
      "vehicles:create",
      "vehicles:edit",
      "vehicles:reminders",
      "vehicles:adjust",
      "customers:view",
      "customers:edit",
      "customers:email_promo",
      "customers:export",
      "analytics:view_dashboard",
      "analytics:revenue_reports",
      "rbac:view_staff",
      "settings:general",
    ],
  },
  {
    id: "garage-coordinator",
    name: "Garage Partner Coordinator",
    description:
      "Handles slot allocations, garage onboarding paperwork, and reschedules",
    color: "text-emerald-700 border-emerald-300 bg-emerald-50",
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    isSystem: true,
    usersCount: 4,
    permissions: [
      "bookings:view",
      "bookings:update_status",
      "bookings:assign_garage",
      "bookings:export",
      "vehicles:view",
      "customers:view",
    ],
  },
  {
    id: "reminder-lead",
    name: "Retention & Reminders Lead",
    description:
      "Owns MOT reminder campaigns, customer re-engagement, and messaging templates",
    color: "text-amber-700 border-amber-300 bg-amber-50",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
    isSystem: false,
    usersCount: 2,
    permissions: [
      "vehicles:view",
      "vehicles:reminders",
      "customers:view",
      "customers:edit",
      "customers:email_promo",
      "bookings:view",
    ],
  },
  {
    id: "driver-support",
    name: "Driver Support Specialist",
    description:
      "Assists drivers with bookings, vehicle records, address updates, and direct emails",
    color: "text-indigo-700 border-indigo-300 bg-indigo-50",
    badgeBg: "bg-indigo-100 text-indigo-900 border-indigo-300",
    isSystem: false,
    usersCount: 5,
    permissions: [
      "bookings:view",
      "customers:view",
      "customers:edit",
      "vehicles:view",
    ],
  },
  {
    id: "financial-auditor",
    name: "Financial Auditor / Accountant",
    description:
      "Read-only access to balance sheets, garage settlement reconciliations, and revenue reports",
    color: "text-slate-700 border-slate-300 bg-slate-50",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    isSystem: false,
    usersCount: 1,
    permissions: [
      "bookings:view",
      "bookings:export",
      "analytics:view_dashboard",
      "analytics:revenue_reports",
      "analytics:export_financials",
    ],
  },
];

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: "STAFF-001",
    name: "Najim Ahmed",
    email: "najim@simplymot.com",
    avatar: "NA",
    roleId: "super-admin",
    roleName: "Super Administrator",
    department: "Executive & IT",
    status: "Active",
    lastLogin: "Active now",
    createdAt: "Jan 10, 2025",
    phone: "+44 7700 900112",
  },
  {
    id: "STAFF-002",
    name: "Sarah Connor",
    email: "sarah.c@simplymot.com",
    avatar: "SC",
    roleId: "operations-manager",
    roleName: "Marketplace Operations Manager",
    department: "Operations",
    status: "Active",
    lastLogin: "15 mins ago",
    createdAt: "Feb 01, 2025",
    phone: "+44 7700 900245",
  },
  {
    id: "STAFF-003",
    name: "Alex Rivera",
    email: "alex.r@simplymot.com",
    avatar: "AR",
    roleId: "garage-coordinator",
    roleName: "Garage Partner Coordinator",
    department: "Partner Relations",
    status: "Active",
    lastLogin: "1 hour ago",
    createdAt: "Mar 14, 2025",
    phone: "+44 7700 900388",
  },
  {
    id: "STAFF-004",
    name: "Maya Lin",
    email: "maya.l@simplymot.com",
    avatar: "ML",
    roleId: "reminder-lead",
    roleName: "Retention & Reminders Lead",
    department: "Marketing",
    status: "Active",
    lastLogin: "Yesterday, 18:20",
    createdAt: "Apr 02, 2025",
    phone: "+44 7700 900431",
  },
  {
    id: "STAFF-005",
    name: "David Miller",
    email: "david.m@simplymot.com",
    avatar: "DM",
    roleId: "driver-support",
    roleName: "Driver Support Specialist",
    department: "Customer Success",
    status: "Active",
    lastLogin: "3 hours ago",
    createdAt: "May 10, 2025",
    phone: "+44 7700 900517",
  },
  {
    id: "STAFF-006",
    name: "Elena Rostova",
    email: "elena.r@simplymot.com",
    avatar: "ER",
    roleId: "financial-auditor",
    roleName: "Financial Auditor / Accountant",
    department: "Finance & Accounting",
    status: "Active",
    lastLogin: "Jun 28, 2026",
    createdAt: "Jun 01, 2025",
    phone: "+44 7700 900623",
  },
  {
    id: "STAFF-007",
    name: "Liam O'Connor",
    email: "liam.oc@simplymot.com",
    avatar: "LO",
    roleId: "garage-coordinator",
    roleName: "Garage Partner Coordinator",
    department: "Partner Relations",
    status: "Invited",
    lastLogin: "Never logged in",
    createdAt: "Just now",
    phone: "+44 7700 900764",
  },
];

export const INITIAL_AUDIT_LOGS: RbacAuditLog[] = [
  {
    id: "LOG-901",
    actorName: "Najim Ahmed",
    actorEmail: "najim@simplymot.com",
    actorRole: "Super Administrator",
    action: "Updated Role Privileges",
    resource: "Role: Retention & Reminders Lead",
    details:
      "Added permission 'vehicles:reminders' to allow campaign template edits",
    timestamp: "10 mins ago",
    ip: "103.21.44.12",
    status: "Success",
  },
  {
    id: "LOG-902",
    actorName: "Sarah Connor",
    actorEmail: "sarah.c@simplymot.com",
    actorRole: "Marketplace Operations Manager",
    action: "Invited New Staff Member",
    resource: "User: liam.oc@simplymot.com",
    details: "Issued invitation link with role 'Garage Partner Coordinator'",
    timestamp: "35 mins ago",
    ip: "192.168.1.104",
    status: "Success",
  },
  {
    id: "LOG-903",
    actorName: "Alex Rivera",
    actorEmail: "alex.r@simplymot.com",
    actorRole: "Garage Partner Coordinator",
    action: "Reassigned Booking",
    resource: "Booking #SM-10248",
    details:
      "Moved MOT slot to AutoCare Leeds (Reference: MOT-883921-LD)",
    timestamp: "1 hour ago",
    ip: "192.168.1.118",
    status: "Success",
  },
  {
    id: "LOG-904",
    actorName: "David Miller",
    actorEmail: "david.m@simplymot.com",
    actorRole: "Driver Support Specialist",
    action: "Updated Customer Profile",
    resource: "Customer #CUST-10241 (Jane Doe)",
    details: "Corrected vehicle registration and primary contact phone number",
    timestamp: "2 hours ago",
    ip: "172.56.21.90",
    status: "Success",
  },
  {
    id: "LOG-905",
    actorName: "Unknown IP / Automated Guard",
    actorEmail: "auth-guard@simplymot.com",
    actorRole: "Security System",
    action: "Blocked Failed Admin Login",
    resource: "Portal Authentication",
    details:
      "3 consecutive invalid password attempts on account admin@unknown.org",
    timestamp: "4 hours ago",
    ip: "45.133.1.20",
    status: "Warning",
  },
  {
    id: "LOG-906",
    actorName: "Elena Rostova",
    actorEmail: "elena.r@simplymot.com",
    actorRole: "Financial Auditor",
    action: "Exported Financial Ledger",
    resource: "Financials: Q2 Garage Settlement Summary",
    details: "Downloaded encrypted CSV ledger for tax reconciliation",
    timestamp: "Jun 28, 2026",
    ip: "195.154.122.3",
    status: "Success",
  },
];

export const RBAC_STATS: RbacStat[] = [
  {
    label: "Admin & Staff Members",
    value: "7",
    change: "+2 this quarter",
    up: true,
    icon: Users,
    subtext: "Across 5 operational departments",
  },
  {
    label: "Configured Roles",
    value: "6",
    change: "100% role coverage",
    up: true,
    icon: ShieldCheck,
    accent: true,
    subtext: "Granular access matrices active",
  },
  {
    label: "Active Team Members",
    value: "6 / 7",
    change: "86% operational",
    up: true,
    icon: UserCheck,
    subtext: "6 active, 1 pending invitation",
  },
  {
    label: "Audit Logs Logged",
    value: "1,248",
    change: "0 security breaches",
    up: true,
    icon: ShieldAlert,
    subtext: "Complete immutable audit trail",
  },
];

// Existing platform accounts an admin can promote to staff (mock)
export const INVITE_CANDIDATES: InviteCandidate[] = [
  {
    id: "USR-1001",
    name: "James Whitfield",
    email: "james.w@gmail.com",
    phone: "+44 7700 900812",
  },
  {
    id: "USR-1002",
    name: "Priya Sharma",
    email: "priya.sharma@outlook.com",
    phone: "+44 7700 900945",
  },
  {
    id: "USR-1003",
    name: "Tom Bakker",
    email: "tom.bakker@gmail.com",
  },
  {
    id: "USR-1004",
    name: "Amira Hassan",
    email: "amira.hassan@yahoo.com",
    phone: "+44 7700 901138",
  },
  {
    id: "USR-1005",
    name: "Chris Dawson",
    email: "chris.dawson@auto care.co.uk",
  },
  {
    id: "USR-1006",
    name: "Wei Chen",
    email: "wei.chen@gmail.com",
    phone: "+44 7700 901275",
  },
];
