import Sidebar from "@/components/sidebar/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="w-full ml-64 p-0 bg-gray-900 overflow-y-auto">
        <div className="min-h-screen p-4">
          {children}
        </div>
      </main>
    </div>
  );
}