"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ShieldCheck, Clock, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { MotGroup, ServiceItem } from "../types";
import { useDeleteServiceMutation } from "../api/garage-pricing.api";

interface MotFeeAddProps {
  garageId: string;
  motServices: MotGroup[];
  onChange: (services: ServiceItem[]) => void;
}

interface LocalMotState {
  id?: string;
  title: string;
  price: string;
  type: "MOT" | "RETEST";
  vehicle_class: string;
}

export default function MotFeeAdd({
  garageId,
  motServices,
  onChange,
}: MotFeeAddProps) {
  const [items, setItems] = useState<LocalMotState[]>([]);
  const [hasClass7, setHasClass7] = useState(false);
  const [deleteService, { isLoading: isDeletingClass7 }] =
    useDeleteServiceMutation();

  useEffect(() => {
    const list: LocalMotState[] = [];
    let class7Found = false;

    if (motServices && motServices.length > 0) {
      motServices.forEach((group) => {
        const vClass = group.vehicle_class || "Class 4";
        if (vClass === "Class 7") class7Found = true;

        if (group.mot) {
          list.push({
            id: group.mot.id,
            title: group.mot.title || `${vClass} MOT Test`,
            price:
              group.mot.price !== undefined && group.mot.price !== null
                ? String(group.mot.price)
                : "",
            type: "MOT",
            vehicle_class: vClass,
          });
        }
        if (group.mot_retest) {
          list.push({
            id: group.mot_retest.id,
            title: group.mot_retest.title || `${vClass} MOT Retest`,
            price:
              group.mot_retest.price !== undefined &&
              group.mot_retest.price !== null
                ? String(group.mot_retest.price)
                : "",
            type: "RETEST",
            vehicle_class: vClass,
          });
        }
      });
    }

    // Ensure Class 4 is always present in list
    const hasClass4Mot = list.some(
      (i) => i.vehicle_class === "Class 4" && i.type === "MOT",
    );
    const hasClass4Retest = list.some(
      (i) => i.vehicle_class === "Class 4" && i.type === "RETEST",
    );

    if (!hasClass4Mot) {
      list.unshift({
        title: "Class 4 MOT Test",
        price: "",
        type: "MOT",
        vehicle_class: "Class 4",
      });
    }
    if (!hasClass4Retest) {
      const idx = list.findIndex(
        (i) => i.vehicle_class === "Class 4" && i.type === "MOT",
      );
      list.splice(idx + 1, 0, {
        title: "Class 4 MOT Retest",
        price: "",
        type: "RETEST",
        vehicle_class: "Class 4",
      });
    }

    setItems(list);
    setHasClass7(class7Found);
    emitChanges(list);
  }, [motServices]);

  const updatePrice = (
    vClass: string,
    type: "MOT" | "RETEST",
    value: string,
  ) => {
    const updated = items.map((item) => {
      if (item.vehicle_class === vClass && item.type === type) {
        return { ...item, price: value };
      }
      return item;
    });

    setItems(updated);
    emitChanges(updated);
  };

  const addClass7 = () => {
    setHasClass7(true);
    const newClass7Items: LocalMotState[] = [
      {
        title: "Class 7 MOT Test",
        price: "",
        type: "MOT",
        vehicle_class: "Class 7",
      },
      {
        title: "Class 7 MOT Retest",
        price: "",
        type: "RETEST",
        vehicle_class: "Class 7",
      },
    ];
    const updated = [...items, ...newClass7Items];
    setItems(updated);
    emitChanges(updated);
  };

  const removeClass7 = async () => {
    const class7Items = items.filter(
      (item) => item.vehicle_class === "Class 7",
    );
    const class7Ids = class7Items
      .map((item) => item.id)
      .filter(Boolean) as string[];

    if (class7Ids.length > 0 && garageId) {
      try {
        await Promise.all(
          class7Ids.map((id) => deleteService({ garageId, id }).unwrap()),
        );
        toast.success("Class 7 MOT services deleted successfully");
      } catch (err: unknown) {
        const msg =
          typeof err === "object" && err !== null && "data" in err
            ? (err as { data?: { message?: string } }).data?.message
            : null;
        toast.error(msg || "Failed to delete Class 7 services");
        return;
      }
    }

    setHasClass7(false);
    const updated = items.filter((item) => item.vehicle_class !== "Class 7");
    setItems(updated);
    emitChanges(updated);
  };

  const emitChanges = (currentItems: LocalMotState[]) => {
    const payload: ServiceItem[] = currentItems.map((item) => ({
      ...(item.id ? { id: item.id } : {}),
      title: item.title,
      price: parseFloat(item.price) || 0,
      type: item.type,
      vehicle_class: item.vehicle_class,
    }));
    onChange(payload);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden mb-6">
      {/* Brand Green Header matching BreaksModal */}
      <div className="bg-[#19CA32] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-base sm:text-lg font-bold">MOT Testing Fees</h2>
        </div>
        {!hasClass7 && (
          <Button
            type="button"
            onClick={addClass7}
            className="bg-white text-[#19CA32] hover:bg-emerald-50 font-bold text-xs h-8 px-3 rounded-md shadow-xs cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class 7</span>
          </Button>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Class 4 Card */}
        <div className="bg-white border border-gray-200 rounded-md p-4 sm:p-5 shadow-xs hover:border-emerald-200 transition-colors space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-100 text-[#19CA32] flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Class 4 MOT Fees
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#19CA32]" />
                <span>MOT Fee (£)</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={
                    items.find(
                      (i) => i.vehicle_class === "Class 4" && i.type === "MOT",
                    )?.price ?? ""
                  }
                  onChange={(e) =>
                    updatePrice("Class 4", "MOT", e.target.value)
                  }
                  className="h-9 text-xs font-semibold bg-white border-gray-300 pl-7 focus-visible:ring-1 focus-visible:ring-[#19CA32] rounded-md"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                  £
                </span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>MOT Retest Fee (£)</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={
                    items.find(
                      (i) =>
                        i.vehicle_class === "Class 4" && i.type === "RETEST",
                    )?.price ?? ""
                  }
                  onChange={(e) =>
                    updatePrice("Class 4", "RETEST", e.target.value)
                  }
                  className="h-9 text-xs font-semibold bg-white border-gray-300 pl-7 focus-visible:ring-1 focus-visible:ring-[#19CA32] rounded-md"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                  £
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Class 7 Card (Conditional) */}
        {hasClass7 && (
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-md p-4 sm:p-5 shadow-xs transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#19CA32] text-white flex items-center justify-center font-bold text-xs">
                  7
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Class 7 MOT Fees
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeClass7}
                disabled={isDeletingClass7}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md shrink-0 cursor-pointer"
                title="Remove Class 7"
              >
                {isDeletingClass7 ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#19CA32]" />
                  <span>MOT Fee (£)</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={
                      items.find(
                        (i) =>
                          i.vehicle_class === "Class 7" && i.type === "MOT",
                      )?.price ?? ""
                    }
                    onChange={(e) =>
                      updatePrice("Class 7", "MOT", e.target.value)
                    }
                    className="h-9 text-xs font-semibold bg-white border-gray-300 pl-7 focus-visible:ring-1 focus-visible:ring-[#19CA32] rounded-md"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                    £
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MOT Retest Fee (£)</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={
                      items.find(
                        (i) =>
                          i.vehicle_class === "Class 7" && i.type === "RETEST",
                      )?.price ?? ""
                    }
                    onChange={(e) =>
                      updatePrice("Class 7", "RETEST", e.target.value)
                    }
                    className="h-9 text-xs font-semibold bg-white border-gray-300 pl-7 focus-visible:ring-1 focus-visible:ring-[#19CA32] rounded-md"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                    £
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
