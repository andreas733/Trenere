import MinSideNav from "./MinSideNav";

export default function MinSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <MinSideNav />
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
