import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="bg-zinc-900 min-h-screen text-white">

      <Navbar />
      <Sidebar />

      <div className="ml-60 pt-14 p-6">
        <Outlet />
      </div>

    </div>
  );
}