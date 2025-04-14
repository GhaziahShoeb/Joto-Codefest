import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function Layout() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className={`flex-1 overflow-y-auto p-6 ${isMobile ? "" : "ml-64"}`}>
        <Outlet />
      </main>
    </div>
  );
}
