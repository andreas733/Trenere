import AdminNav from "../AdminNav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav />
      <main className="p-6">{children}</main>
    </div>
  );
}
