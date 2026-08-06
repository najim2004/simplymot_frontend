import React from 'react'
import {
  OverviewCard,
  NewGarages,
  NewDrivers,
  NewBookings,
} from "@/features/admin";

export default function AdminDashboard() {
    return (
        <div className='space-y-5'>
            {/* overview card */}
            <OverviewCard />
            <NewGarages />
            <NewDrivers />
            <NewBookings />
        </div>
    )
}
