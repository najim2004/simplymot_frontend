"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, Layers, Wrench } from "lucide-react";
import { toast } from "react-toastify";
import { ServiceItem } from "../types";
import { useDeleteServiceMutation } from "../api/garage-pricing.api";

interface AdditionalServicesAddProps {
  garageId: string;
  otherServices: ServiceItem[];
  onChange: (services: ServiceItem[]) => void;
}

interface LocalOtherService {
  id?: string;
  title: string;
}

export default function AdditionalServicesAdd({
  garageId,
  otherServices,
  onChange,
}: AdditionalServicesAddProps) {
  const [items, setItems] = useState<LocalOtherService[]>([]);
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (otherServices) {
      const mapped = otherServices.map((s) => ({
        id: s.id,
        title: s.title || "",
      }));
      setItems(mapped);
      emitChanges(mapped);
    }
  }, [otherServices]);

  const updateTitle = (index: number, newTitle: string) => {
    const updated = items.map((item, idx) =>
      idx === index ? { ...item, title: newTitle } : item
    );
    setItems(updated);
    emitChanges(updated);
  };

  const addService = () => {
    const updated = [...items, { title: "" }];
    setItems(updated);
    emitChanges(updated);
  };

  const removeService = async (index: number) => {
    const item = items[index];
    if (item.id && garageId) {
      try {
        setDeletingId(item.id);
        await deleteService({ garageId, id: item.id }).unwrap();
        toast.success("Service deleted successfully");
      } catch (err: unknown) {
        const msg =
          typeof err === "object" && err !== null && "data" in err
            ? (err as { data?: { message?: string } }).data?.message
            : null;
        toast.error(msg || "Failed to delete service");
        setDeletingId(null);
        return;
      }
      setDeletingId(null);
    }

    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
    emitChanges(updated);
  };

  const emitChanges = (currentItems: LocalOtherService[]) => {
    const payload: ServiceItem[] = currentItems
      .filter((item) => item.title.trim() !== "")
      .map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        title: item.title.trim(),
        price: 0,
        type: "OTHERS",
      }));
    onChange(payload);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden mb-6">
      {/* Brand Green Header matching BreaksModal */}
      <div className="bg-[#19CA32] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          <h2 className="text-base sm:text-lg font-bold">Additional Services</h2>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-6 space-y-3">
        {/* Add Service Button (Matching BreaksModal Add Break button) */}
        <Button
          type="button"
          variant="outline"
          onClick={addService}
          className="w-full border-dashed border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-[#19CA32] hover:text-[#19CA32] text-xs font-semibold h-9 rounded-md cursor-pointer flex items-center justify-center gap-1.5 mb-2"
        >
          <Plus className="w-4 h-4 text-[#19CA32]" />
          <span>Add Service</span>
        </Button>

        {/* List of Services - 3 columns on xl devices, 2 columns on lg devices, 1 column on smaller devices */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {items.map((item, index) => {
              const isCurrentDeleting = deletingId === item.id;
              return (
                <div
                  key={item.id || index}
                  className="bg-white border border-gray-200 rounded-md p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-emerald-50 text-[#19CA32] border border-emerald-100 flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Service Description"
                      value={item.title}
                      onChange={(e) => updateTitle(index, e.target.value)}
                      disabled={isCurrentDeleting}
                      className="h-9 text-xs font-semibold bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-[#19CA32] rounded-md flex-1 min-w-0"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(index)}
                    disabled={isCurrentDeleting || isDeleting}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md shrink-0 cursor-pointer"
                    title="Delete Service"
                  >
                    {isCurrentDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Wrench className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs font-medium">No additional services added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
