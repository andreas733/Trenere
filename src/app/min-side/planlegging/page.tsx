import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PlanleggingPage() {
  redirect("/min-side/planlegging/a");
}
