"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, X, Loader2 } from "lucide-react";
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
      setItems(
        otherServices.map((s) => ({
          id: s.id,
          title: s.title || "",
        }))
      );
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
        price: 0, // No price required for others
        type: "OTHERS",
      }));
    onChange(payload);
  };

  return (
    <div className="mb-6">
      <Card className="border border-[#19CA32] py-5">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Additional Services</CardTitle>
            <CardDescription>
              Add any extra services you offer so they can be displayed on your profile.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addService}
            className="border-[#19CA32] text-[#19CA32] hover:bg-green-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {items.length === 0 ? (
            <div className="rounded-md border border-dashed border-[#19CA32] p-6 text-center">
              <p className="text-sm text-gray-500">No additional services added yet.</p>
              <p className="text-sm text-gray-500">
                Click &quot;Add Service&quot; above to create one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((item, index) => {
                const isCurrentDeleting = deletingId === item.id;
                return (
                  <div
                    key={item.id || index}
                    className="rounded-md border border-[#19CA32] p-4 space-y-2"
                  >
                    <Label className="text-sm font-medium text-gray-700">
                      Service Name {index + 1}
                    </Label>
                    <div className="relative">
                      <Input
                        value={item.title}
                        onChange={(e) => updateTitle(index, e.target.value)}
                        placeholder="e.g. Brake Check"
                        className="h-11 pr-10 border border-[#19CA32]"
                        disabled={isCurrentDeleting}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeService(index)}
                        disabled={isCurrentDeleting || isDeleting}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-red-50"
                      >
                        {isCurrentDeleting ? (
                          <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
