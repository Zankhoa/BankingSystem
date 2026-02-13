import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { NavLinkProps } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const nameUser = user?.userName;

  const location = useLocation();
  const isTransferActive = location.pathname.startsWith("/transfer");

  const navClass: NavLinkProps["className"] = ({ isActive }) =>
  `transition hover:-translate-y-0.5 transform block pb-0.5
   ${isActive ? "border-b-2 border-white" : "hover:text-gray-300"}`;

  return (
    <header className="bg-black text-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-bold text-xl tracking-wider group"
        >
          <span className="transition-transform duration-300 group-hover:translate-x-2">
            Banking System
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">

          <NavLink to="/dashboard" className={navClass}>
            Trang chủ
          </NavLink>

          {/* Chuyển tiền */}
          <div className="relative group">
            <span
              className={`cursor-pointer pb-0.5 border-b-2 transition
                ${isTransferActive ? "border-white" : "border-transparent"}
              `}
            >
              Chuyển tiền
            </span>

            {/* Dropdown */}
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible
                            transition-all duration-200 z-50">

              <NavLink
                to="/transfer/internal"
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-t-lg
                   ${isActive
                     ? "bg-slate-100 font-semibold text-black"
                     : "text-slate-700 hover:bg-slate-100"}`
                }
              >
                Chuyển tiền nội bộ
              </NavLink>

              <NavLink
                to="/transfer/external"
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-b-lg
                   ${isActive
                     ? "bg-slate-100 font-semibold text-black"
                     : "text-slate-700 hover:bg-slate-100"}`
                }
              >
                Chuyển tiền ngân hàng
              </NavLink>

            </div>
          </div>

          <NavLink to="/history" className={navClass}>
            Lịch sử
          </NavLink>

        </nav>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <span className="text-sm hidden sm:block">
            Xin chào, <strong>{nameUser}</strong>
          </span>
          <div className="w-8 h-8 bg-gray-800 border border-gray-600 rounded-full
                          flex items-center justify-center text-xs text-white
                          hover:animate-bounce cursor-pointer">
            {nameUser?.charAt(0).toUpperCase()}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
