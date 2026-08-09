"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { MotGroup, ServiceItem } from "../types";

interface MotFeeAddProps {
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

export default function MotFeeAdd({ motServices, onChange }: MotFeeAddProps) {
  const [items, setItems] = useState<LocalMotState[]>([]);
  const [hasClass7, setHasClass7] = useState(false);

  useEffect(() => {
    if (motServices && motServices.length > 0) {
      const list: LocalMotState[] = [];
      let class7Found = false;

      motServices.forEach((group) => {
        const vClass = group.vehicle_class || "Class 4";
        if (vClass === "Class 7") class7Found = true;

        list.push({
          id: group.mot?.id,
          title: group.mot?.title || `${vClass} MOT Test`,
          price: group.mot?.price !== undefined && group.mot?.price !== null ? String(group.mot.price) : "",
          type: "MOT",
          vehicle_class: vClass,
        });

        list.push({
          id: group.mot_retest?.id,
          title: group.mot_retest?.title || `${vClass} MOT Retest`,
          price: group.mot_retest?.price !== undefined && group.mot_retest?.price !== null ? String(group.mot_retest.price) : "",
          type: "RETEST",
          vehicle_class: vClass,
        });
      });

      setItems(list);
      setHasClass7(class7Found);
    } else {
      // Default Class 4 UI if no MOT services exist
      setItems([
        { title: "Class 4 MOT Test", price: "", type: "MOT", vehicle_class: "Class 4" },
        { title: "Class 4 MOT Retest", price: "", type: "RETEST", vehicle_class: "Class 4" },
      ]);
      setHasClass7(false);
    }
  }, [motServices]);

  const updatePrice = (vClass: string, type: "MOT" | "RETEST", value: string) => {
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
    const updated = [
      ...items,
      { title: "Class 7 MOT Test", price: "", type: "MOT", vehicle_class: "Class 7" },
      { title: "Class 7 MOT Retest", price: "", type: "RETEST", vehicle_class: "Class 7" },
    ];
    setItems(updated);
    emitChanges(updated);
  };

  const removeClass7 = () => {
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

  // Group items by vehicle class for rendering map
  const classes = Array.from(new Set(items.map((i) => i.vehicle_class)));

  return (
    <div className="mb-6">
      <Card className="border border-[#19CA32]">
        <CardContent className="p-6 space-y-6">
          {classes.map((vClass) => {
            const motItem = items.find((i) => i.vehicle_class === vClass && i.type === "MOT");
            const retestItem = items.find((i) => i.vehicle_class === vClass && i.type === "RETEST");

            return (
              <div key={vClass} className="rounded-md border border-[#19CA32] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-gray-900">{vClass}</h3>
                  {vClass === "Class 4" && !hasClass7 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addClass7}
                      className="h-9 border-[#19CA32] text-[#19CA32] hover:bg-green-50"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Class 7
                    </Button>
                  )}
                  {vClass === "Class 7" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeClass7}
                      className="h-8 w-8 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">MOT Fee</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">£</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={motItem?.price ?? ""}
                        onChange={(e) => updatePrice(vClass, "MOT", e.target.value)}
                        className="h-11 pl-8 border border-[#19CA32]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">MOT Retest Fee</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">£</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={retestItem?.price ?? ""}
                        onChange={(e) => updatePrice(vClass, "RETEST", e.target.value)}
                        className="h-11 pl-8 border border-[#19CA32]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <p className="text-sm text-gray-600">
            Don&apos;t forget to click &quot;Save&quot; below to confirm your changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
