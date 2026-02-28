import { canAccessWorkoutLibrary, canAccessPlanner } from "@/lib/permissions";
import MinSideNav from "./MinSideNav";

export default async function MinSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [canWorkoutLibrary, canPlanner] = await Promise.all([
    canAccessWorkoutLibrary(),
    canAccessPlanner(),
  ]);

  return (
    <div className="min-h-screen bg-slate-100">
      <MinSideNav
        canAccessWorkoutLibrary={canWorkoutLibrary}
        canAccessPlanner={canPlanner}
      />
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
