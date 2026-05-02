import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/auth/RoleGuard";
import { redirect } from "next/navigation";

export default function SuperLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['super_admin']} fallback={<div className="p-20 text-center">Unauthorized. Redirecting...</div>}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
