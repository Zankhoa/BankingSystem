
import { useAuth } from "../context/AuthContext";

const Header = () => {
 const { user } = useAuth();
    const nameUser =  user?.userName;
    console.log("Header User Name:", nameUser);

 return (
    <header className="bg-black text-white shadow-md">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      
      {/* Logo Area */}
      <div className="flex items-center gap-2 font-bold text-xl tracking-wider cursor-pointer group">
        {/* TEXT: Di chuyển nhẹ khi di chuột vào (hover) */}
        <span className="transition-transform duration-300 group-hover:translate-x-2">
          Banking System
        </span>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex gap-6 text-sm font-medium">
        <a href="#" className="hover:text-gray-300 transition hover:-translate-y-0.5 transform block">Trang chủ</a>
      <div className="relative group">
  <a href="" className="text-white border-b-2 border-white pb-0.5 hover:-translate-y-0.5 transform block transition">
    Chuyển tiền
  </a>

  {/* Dropdown */}
  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
    <a href="/transfer/internal" className="block px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-t-lg">
      Chuyển tiền nội bộ
    </a>
    <a href="/transfer/bank" className="block px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-b-lg">
      Chuyển tiền ngân hàng
    </a>
  </div>
</div>

        <a href="#" className="hover:text-gray-300 transition hover:-translate-y-0.5 transform block">Lịch sử</a>
        <a href="#" className="hover:text-gray-300 transition hover:-translate-y-0.5 transform block">Cài đặt</a>
      </nav>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <span className="text-sm hidden sm:block">Xin chào, <strong>{nameUser}</strong></span>
        <div className="w-8 h-8 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-xs text-white hover:animate-bounce cursor-pointer">
          {nameUser?.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  </header>
 );
};
export default Header;
