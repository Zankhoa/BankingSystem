import { BrowserRouter, Route, Navigate, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';

// Import các page
import LoginPage from './page/LoginPage';
import RegisterPage from './page/RegisterPage';
import TransferPage from './page/TransferPage';
import Header from './page/Header'; // Lưu ý: Header thường không để trong Route riêng mà để layout chung
import CreatePinPage from './page/CreatePinPage';
import ProtectedRoute from './component/ProtectedRoute';
import './index.css';
import DashboardPage from './page/DasboardPage';
import TransactionHistory from './page/HistoryTransactionPage';
import TransferExternalPage from './page/TrafernExternalPage';


// 1. TẠO COMPONENT CON ĐỂ XỬ LÝ ROUTES & ANIMATION
const AnimatedRoutes = () => {
  const location = useLocation(); // Bây giờ dùng được rồi vì nằm trong BrowserRouter

  return (
    <AnimatePresence mode="wait">
      {/* Phải truyền location và key vào Routes để Framer Motion nhận biết khi nào đổi trang */}
      <Routes location={location} key={location.pathname}>
        
        {/* --- Route Mặc định & Public --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- KHU VỰC BẢO VỆ (Private Routes) --- */}
        <Route element={<ProtectedRoute />}>
         <Route path="/test" element={<DashboardPage />} />
          <Route path="/transfer/internal" element={<TransferPage />} />
          <Route path="/transfer/external" element={<TransferExternalPage />} />
          <Route path="/transfer/register-pin" element={<CreatePinPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/header" element={<Header />} />
          <Route path="/history" element={<TransactionHistory />} />
        </Route>

        {/* --- Route 404 (Nên để cuối cùng) --- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    </AnimatePresence>
  );
};

// 2. APP CHÍNH
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Gọi component con ở đây */}
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;