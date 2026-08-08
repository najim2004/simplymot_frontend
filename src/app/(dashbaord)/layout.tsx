import DashboardLayout from "@/components/reusable/Dashboard/MainLayout/DashboardLayout";
import { SubscriptionProtection } from "@/lib/subscriptionProtection";

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriptionProtection>
      <DashboardLayout>{children}</DashboardLayout>
    </SubscriptionProtection>
  );
}
