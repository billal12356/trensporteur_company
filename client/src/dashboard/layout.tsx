import { Outlet } from "react-router-dom";
import { Sidebar } from "./app-sidebar";
import { NavBar } from "./NavBar";
// أو أي مكون تضعه بالأعلى

const Layout = () => {
  return (
    <div className="flex ">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-gray-100 min-h-screen">
        <NavBar />
        <main className="p-4 flex-1 h-[calc(100vh-64px)] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
