"use client";

import React from "react";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import {
  useGetVehiclesQuery,
  useDeleteVehicleMutation,
  useAddVehicleMutation,
  VehicleGridSkeleton,
  VehicleGridCard,
  AddVehicleCardButton,
  AddVehicleModal,
  MyVehiclesDetailsModal,
} from "@/features/driver";

export default function MyVehicles() {
  const [isOpenAddVehicleModal, setIsOpenAddVehicleModal] =
    React.useState(false);
  const [isOpenDeleteVehicleModal, setIsOpenDeleteVehicleModal] =
    React.useState(false);
  const [vehicleIdForDelete, setVehicleIdForDelete] = React.useState(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const { data, isLoading: isLoadingVehicles } = useGetVehiclesQuery();
  const vehicles = data?.data;

  const [addVehicle, { isLoading: isAdding }] = useAddVehicleMutation();
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation();

  const addVehicleHandler = async ({ registration_number }) => {
    try {
      const response = await addVehicle({ registration_number }).unwrap();
      if (response.success) {
        toast.success(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteVehicleHandler = async () => {
    try {
      if (!vehicleIdForDelete) return;
      const response = await deleteVehicle(vehicleIdForDelete).unwrap();
      if (response.success) {
        toast.success(response.message);
        setIsOpenDeleteVehicleModal(false);
        setVehicleIdForDelete(null);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Vehicles</h1>
        <p className="text-gray-600 text-sm">
          Free MOT reminders are sent for every vehicle in your account.
          We&apos;ll email you before each MOT is due.
        </p>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-[#F8FAFB] p-4 rounded-[16px]">
        {isLoadingVehicles ? (
          <VehicleGridSkeleton count={4} />
        ) : (
          <>
            {vehicles?.map((vehicle) => (
              <VehicleGridCard
                key={vehicle.id}
                vehicle={vehicle}
                isDeleting={isDeleting}
                onVehicleClick={() => {}}
                onDeleteClick={() => {
                  setVehicleIdForDelete(vehicle.id);
                  setIsOpenDeleteVehicleModal(true);
                }}
              />
            ))}

            <AddVehicleCardButton
              onClick={() => setIsOpenAddVehicleModal(true)}
            />
          </>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isOpenAddVehicleModal}
        isAdding={isAdding}
        onClose={() => setIsOpenAddVehicleModal(false)}
        onSubmit={addVehicleHandler}
      />

      {/* Vehicle Details Modal */}
      {/* <MyVehiclesDetailsModal
        isOpen={isOpenDeleteVehicleModal}
        selectedVehicle={selectedVehicle}
        onClose={() => setIsOpenDeleteVehicleModal(false)}
        onBookMyMOT={handleBookMyMOT}
        onMotReports={handleMotReports}
        formatDate={formatDate}
      /> */}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={isOpenDeleteVehicleModal}
        onClose={() => setIsOpenDeleteVehicleModal(false)}
        onConfirm={deleteVehicleHandler}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
