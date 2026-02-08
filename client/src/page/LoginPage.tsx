import React, { useState } from "react";
import type { APIResponse } from '../types';
import { AxiosError } from 'axios';
import { Navigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import JSEncrypt from "jsencrypt";
import AnimatedPage from "./AnimatedPage";
import { User, Lock, ArrowRight, Loader2 } from "lucide-react"; // Import Icon

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginContext, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setIsLoading(true);
    try {
      // B1: Lấy RSA key
      const keyData = await authService.getPublicKey();
      
      // B2: Mã hóa password
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(keyData.publicKey);
      const encryptedPassword = encryptor.encrypt(password);

      if (!encryptedPassword) {
        toast.error("Lỗi mã hóa mật khẩu. Vui lòng thử lại.");
        return;
      }

      // B3: Gọi login API
      const res = await authService.login({
        Username: username,
        EncryptedPassword: encryptedPassword,
      });

      if (res.sessionSecret != null) {
        localStorage.setItem('signature', res.sessionSecret);
      }
      
      await loginContext();
      toast.success("Đăng nhập thành công!");
      
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      const message = axiosError.response?.data?.message || "Đăng nhập thất bại!";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 border border-gray-100">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              DigiBank <span className="text-green-600">Login</span>
            </h1>
            <p className="text-sm text-gray-500">
              Chào mừng quay trở lại, vui lòng đăng nhập.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors sm:text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors sm:text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/30"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ĐĂNG NHẬP <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-bold text-green-600 hover:text-green-500 hover:underline transition-colors">
              Đăng ký ngay
            </Link>
          </div>
          
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    </AnimatedPage>
  );
};

export default LoginPage;