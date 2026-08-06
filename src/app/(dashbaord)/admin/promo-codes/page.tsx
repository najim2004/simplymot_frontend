"use client";

import {
  CalendarIcon,
  Copy,
  Gift,
  Loader2,
  Plus,
  PowerOff,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PromoCodeDuration,
  PromoCodeStatus,
  useCreatePromoCodeMutation,
  useDeactivatePromoCodeMutation,
  useGetPromoCodesQuery,
} from "@/features/admin";

const durationOptions: Array<{
  label: string;
  value: PromoCodeDuration;
  helper: string;
}> = [
  { label: "Duration", value: "REPEATING", helper: "Free for selected months" },
  { label: "Lifetime", value: "FOREVER", helper: "Free forever" },
  { label: "First invoice", value: "ONCE", helper: "Free once" },
];

type PromoTab = "active" | "archived";

const promoTabs: Array<{ key: PromoTab; label: string }> = [
  { key: "active", label: "Active" },
  { key: "archived", label: "Inactive" },
];
const statusBadgeStyles: Record<PromoCodeStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  EXPIRED: "bg-red-50 text-red-700",
};

const statusLabels: Record<PromoCodeStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EXPIRED: "Expired",
};

const formatTableDate = (value: string | null | undefined) => {
  if (!value) return "-";
  try {
    return format(new Date(value), "dd/MM/yy");
  } catch {
    return "-";
  }
};

const DatePicker = ({
  date,
  onDateChange,
  placeholder,
}: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full min-w-[180px] justify-start pr-10 text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {date ? format(date, "dd/MM/yyyy") : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {date && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDateChange(undefined);
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label={`Clear ${placeholder}`}
          title={`Clear ${placeholder}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const startOfSelectedDay = (date?: Date) => {
  if (!date) return undefined;
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value.toISOString();
};

const endOfSelectedDay = (date?: Date) => {
  if (!date) return undefined;
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value.toISOString();
};

export default function PromoCodesPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<PromoTab>("active");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [form, setForm] = useState({
    prefix: "",
    duration: "REPEATING" as PromoCodeDuration,
    duration_in_months: 3,
    max_redemptions: "",
  });

  const listFilters = {
    search,
    date_from: startOfSelectedDay(dateFrom),
    date_to: endOfSelectedDay(dateTo),
  };

  const { data, isLoading } = useGetPromoCodesQuery({
    page: 1,
    limit: 50,
    ...listFilters,
    status: activeTab,
  });
  const { data: activeCountData } = useGetPromoCodesQuery({
    page: 1,
    limit: 1,
    status: "active",
  });
  const { data: inactiveCountData } = useGetPromoCodesQuery({
    page: 1,
    limit: 1,
    status: "archived",
  });
  const [createPromoCode, { isLoading: isCreating }] =
    useCreatePromoCodeMutation();
  const [deactivatePromoCode, { isLoading: isDeactivating }] =
    useDeactivatePromoCodeMutation();

  const promoCodes = data?.data || [];

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await createPromoCode({
        prefix: form.prefix || undefined,
        percent_off: 100,
        duration: form.duration,
        duration_in_months:
          form.duration === "REPEATING" ? form.duration_in_months : undefined,
        max_redemptions: form.max_redemptions
          ? Number(form.max_redemptions)
          : undefined,
        expires_at: endOfSelectedDay(expiryDate),
      }).unwrap();

      toast.success("Promo code created successfully");
      setForm({
        prefix: "",
        duration: "REPEATING",
        duration_in_months: 3,
        max_redemptions: "",
      });
      setExpiryDate(undefined);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create promo code");
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivatePromoCode(id).unwrap();
      toast.success("Promo code deactivated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to deactivate promo code");
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8">
      <div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Promo Codes</h1>
          <p className="text-sm text-gray-500">
            Create free subscription offers and turn them off whenever needed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg bg-white px-6 py-10 shadow-sm">
          <h3 className="text-md">Active Promo Codes</h3>
          <p className="text-2xl font-bold">{activeCountData?.total ?? 0}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-lg bg-white px-6 py-10 shadow-sm">
          <h3 className="text-md">Inactive Promo Codes</h3>
          <p className="text-2xl font-bold">{inactiveCountData?.total ?? 0}</p>
        </div>
      </div>

      <div className="space-y-6">
        <form
          onSubmit={handleCreate}
          className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DDF7E0] text-[#19CA32]">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Create code</h2>
              <p className="text-xs text-gray-500">Stripe coupon + promo code</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Type
              </label>
              <Select
                value={form.duration}
                onValueChange={(value: PromoCodeDuration) =>
                  setForm((current) => ({
                    ...current,
                    duration: value,
                    duration_in_months:
                      value === "REPEATING"
                        ? current.duration_in_months || 3
                        : 3,
                  }))
                }
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="block text-sm font-medium text-gray-700">
              Duration (months)
              <div className="mt-1">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={form.duration_in_months}
                  disabled={form.duration !== "REPEATING"}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      duration_in_months: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#19CA32] focus:ring-2 focus:ring-[#19CA32]/10 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
              {form.duration !== "REPEATING" && (
                <span className="mt-1 block text-xs text-gray-400">
                  Not required
                </span>
              )}
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Expiry date
              <div className="mt-1">
                <DatePicker
                  date={expiryDate}
                  onDateChange={setExpiryDate}
                  placeholder="Select expiry"
                />
              </div>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Limit
              <input
                type="number"
                min={1}
                value={form.max_redemptions}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    max_redemptions: event.target.value,
                  }))
                }
                placeholder="Infinity"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#19CA32] focus:ring-2 focus:ring-[#19CA32]/10"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Prefix
              <input
                value={form.prefix}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    prefix: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="Optional"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase outline-none focus:border-[#19CA32] focus:ring-2 focus:ring-[#19CA32]/10"
              />
            </label>

            <button
              type="submit"
              disabled={isCreating}
              className="flex w-full items-center justify-center gap-2 self-end rounded-lg bg-[#19CA32] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 xl:mt-6"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create promo code
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-100 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <nav className="flex flex-wrap gap-2 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm w-fit">
                {promoTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-[6px] cursor-pointer font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search codes"
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#19CA32] focus:ring-2 focus:ring-[#19CA32]/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DatePicker
                date={dateFrom}
                onDateChange={setDateFrom}
                placeholder="From date"
              />
              <DatePicker
                date={dateTo}
                onDateChange={setDateTo}
                placeholder="To date"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Duration (months)</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                      Loading promo codes...
                    </td>
                  </tr>
                ) : promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                      {activeTab === "active"
                        ? "No active promo codes found."
                        : "No inactive promo codes found."}
                    </td>
                  </tr>
                ) : (
                  promoCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {promo.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCode(promo.code)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        {promo.name && (
                          <p className="text-xs text-gray-500">{promo.name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {promo.display_duration}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {promo.redeemed_count}
                        {promo.max_redemptions
                          ? ` / ${promo.max_redemptions}`
                          : " / Infinity"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatTableDate(promo.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {promo.expires_at
                          ? formatTableDate(promo.expires_at)
                          : "No expiry"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeStyles[promo.status]}`}
                        >
                          {statusLabels[promo.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {activeTab === "active" ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(promo.id)}
                            disabled={!promo.is_active || isDeactivating}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                          >
                            <PowerOff className="h-4 w-4" />
                            Deactivate
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
