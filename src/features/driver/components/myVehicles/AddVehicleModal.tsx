import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddVehicleForm>();

  const handleClose = () => {
    onClose();
    reset();
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
      className="max-w-sm"
    >
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div
          className={`bg-[${brandColor}] text-white p-4 flex items-center justify-between`}
        >
          <h2 className="text-lg font-semibold">Add Another Vehicle</h2>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-4">
            {/* Registration Number Input */}
            <div className="space-y-2">
              <Label
                htmlFor="registration_number"
                className="text-sm font-medium text-gray-700"
              >
                Registration Number
              </Label>
              <Input
                id="registration_number"
                type="text"
                placeholder=""
                className={`w-full py-3 text-base border-gray-300 focus:border-[${brandColor}] focus:ring-[${brandColor}] rounded-md`}
                {...register("registration_number", {
                  required: "Registration number is required",
                  pattern: {
                    value: registrationPattern,
                    message: "Invalid registration number format",
                  },
                })}
              />
              {errors.registration_number && (
                <p className="text-red-500 text-sm">
                  {errors.registration_number.message}
                </p>
              )}
            </div>

            {/* Add Vehicle Button */}
            <Button
              type="submit"
              disabled={isAdding}
              className={`w-full bg-[${brandColor}] hover:bg-[${brandColorHover}] text-white font-medium py-3 text-base rounded-md transition-all duration-200 cursor-pointer disabled:bg-[${brandColor}]/70 disabled:cursor-not-allowed`}
            >
              {isAdding ? "Adding Vehicle..." : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </div>
    </CustomReusableModal>
  );
}
