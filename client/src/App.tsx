import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './page/LoginPage';
import './index.css';
import ProtectedRoute from './component/ProtectedRoute';
import ATMPage from './page/ATMPage';
import RegisterPage from './page/RegisterPage';
import TransferPage from './page/TransferPage';
import Header from './page/Header';
import TransferBankPage from './page/TransferBankPage';
function App() {
 return(
  <BrowserRouter>
  {/* AuthProvider phải nằm TRONG BrowserRouter vì nó có thể dùng navigate (tuỳ logic) */}
  <AuthProvider>
    <Routes>
      {/* Route Mặc định */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Route Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* --- KHU VỰC BẢO VỆ (Private Routes) --- */}
            {/* Mọi route nằm trong này đều được check Token kỹ càng */}
            <Route element={<ProtectedRoute />}>
                <Route path="/withdraw" element={<ATMPage />} />
                <Route path="/transfer/internal" element={<TransferPage />} />
                <Route path="/transfer/bank" element={<TransferBankPage />} />
                <Route path="/header" element={<Header/>} />

                {/* Thêm các trang khác sau này: /profile, /transactions... */}
          {/* Route 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            </Route>
    </Routes>
  </AuthProvider>
  </BrowserRouter>
 );
}

export default App;