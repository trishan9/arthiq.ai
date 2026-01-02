import { Outlet } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
