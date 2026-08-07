import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";

export interface AddVehicleForm {
  registration_number: string;
}

const DEFAULT_REGISTRATION_PATTERN = /^[A-Z0-9\s]{2,9}$/i;

interface AddVehicleModalProps {
  isOpen: boolean;
  isAdding: boolean;
  onClose: () => void;
  onSubmit: (data: AddVehicleForm) => Promise<void>;
  brandColor?: string;
  brandColorHover?: string;
  registrationPattern?: RegExp;
}

export default function AddVehicleModal({
  isOpen,
  isAdding,
  onClose,
  onSubmit,
  brandColor = "#19CA32",
  brandColorHover = "#16b82e",
  registrationPattern = DEFAULT_REGISTRATION_PATTERN,
}: AddVehicleModalProps) {
  const form = useForm<AddVehicleForm>({
    defaultValues: {
      registration_number: "",
    },
  });

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const handleFormSubmit = async (data: AddVehicleForm) => {
    await onSubmit(data);
  };

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Another Vehicle"
      showHeader={false}
      hideClose={true}
      contentClassName="p-0"
      className="max-w-md"
    >
      <div className="bg-white rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className={`bg-[${brandColor}] text-white p-4 flex items-center justify-between`}
        >
          <h2 className="text-lg font-semibold">Add Another Vehicle</h2>
        </div>

        {/* Form Content */}
        <div className="p-5 flex-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="registration_number"
                rules={{
                  required: "Registration number is required",
                  pattern: {
                    value: registrationPattern,
                    message: "Invalid registration number format",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 block">
                      Registration Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g. LV62RVL"
                        className="py-6 px-4 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base rounded-lg font-mono uppercase"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 text-sm rounded-lg cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={isAdding}
                  className={`w-full cursor-pointer bg-[${brandColor}] hover:bg-[${brandColorHover}] text-white font-medium py-2.5 text-sm rounded-lg transition-all duration-200`}
                >
                  {isAdding ? "Adding..." : "Add Vehicle"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </CustomReusableModal>
  );
}
