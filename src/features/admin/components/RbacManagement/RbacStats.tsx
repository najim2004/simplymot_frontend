"use client";

import { AdminStatsCards, type AdminStatItem } from "../shared/AdminStatsCards";

interface RbacStatsProps {
  stats: AdminStatItem[];
}

export function RbacStats({ stats }: RbacStatsProps) {
  return <AdminStatsCards stats={stats} />;
}
