import { useMemo } from "react";

interface Vehicle {
  id: string;
  mot_expiry_date: string | null;
}

interface UseVehicleRemindersProps {
  vehicles: Vehicle[];
  autoReminderEnabled: boolean;
  reminderDaysInAdvance: number;
}

export function useVehicleReminders({
  vehicles,
  autoReminderEnabled,
  reminderDaysInAdvance,
}: UseVehicleRemindersProps) {
  const vehiclesNeedingReminder = useMemo(() => {
    if (!autoReminderEnabled) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return vehicles.filter((vehicle) => {
      if (!vehicle.mot_expiry_date) return false;
      const expiryDate = new Date(vehicle.mot_expiry_date);
      expiryDate.setHours(0, 0, 0, 0);

      const daysRemaining = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      return daysRemaining === reminderDaysInAdvance;
    });
  }, [vehicles, autoReminderEnabled, reminderDaysInAdvance]);

  return {
    vehiclesNeedingReminder,
    needsReminderCount: vehiclesNeedingReminder.length,
  };
}

