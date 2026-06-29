import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <OnboardingTour />
      {children}
    </DashboardShell>
  );
}
