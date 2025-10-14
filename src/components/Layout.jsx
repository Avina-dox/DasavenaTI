import { Outlet } from "react-router-dom";
import NavBar from "./Navbar";


export default function Layout() {
  return (
    <div className="">
      <NavBar /> 
      
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
