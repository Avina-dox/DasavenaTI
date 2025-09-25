import { Outlet } from "react-router-dom";
import NavBar from "./Navbar";


export default function Layout() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <NavBar /> 
      
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
