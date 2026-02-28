import { canAccessWorkoutLibrary, canAccessPlanner, canAccessStatistics } from "@/lib/permissions";
import MinSideNav from "./MinSideNav";

export default async function MinSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [canWorkoutLibrary, canPlanner, canStats] = await Promise.all([
    canAccessWorkoutLibrary(),
    canAccessPlanner(),
    canAccessStatistics(),
  ]);

  return (
    <div className="min-h-screen bg-slate-100">
      <MinSideNav
        canAccessWorkoutLibrary={canWorkoutLibrary}
        canAccessPlanner={canPlanner}
        canAccessStatistics={canStats}
      />
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
