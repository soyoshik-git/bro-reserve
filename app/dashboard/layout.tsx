import DashboardNav from "./DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy">
      <DashboardNav />
      {/* ヘッダー分の上余白 + ボトムナビ分の下余白 */}
      <div className="pt-14 pb-20">
        {children}
      </div>
    </div>
  );
}
