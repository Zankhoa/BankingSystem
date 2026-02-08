import React, { useState } from "react";
import { AxiosError } from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Lưu ý: Import service phù hợp với dự án của bạn (authService hoặc registerService)
import { authService } from "../services/authService"; 
import type { APIResponse } from '../types';
import JSEncrypt from "jsencrypt";
import AnimatedPage from "./AnimatedPage";
// Import thêm icon Phone
import { User, Lock, Mail, CheckCircle, Loader2, Phone } from "lucide-react";
import { registerService } from "../services/registerService";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "", // Đã thêm state phone
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password, confirmPassword, email, phone } = formData;

    // Validate đầy đủ
    if (!username || !password || !email || !phone) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    
    // Validate khớp mật khẩu
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Validate sơ bộ số điện thoại (Tùy chọn)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
        toast.warning("Số điện thoại không hợp lệ!");
        return;
    }

    setIsLoading(true);
    try {
      // B1: Lấy RSA Key
      const keyData = await authService.getPublicKey();
      
      // B2: Mã hóa password
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(keyData.publicKey);
      const encryptedPassword = encryptor.encrypt(password);

      if (!encryptedPassword) {
        toast.error("Lỗi mã hóa. Vui lòng thử lại.");
        return;
      }

      // B3: Gọi API Register (Gửi kèm Phone)
      // Đảm bảo Payload khớp với Backend của bạn
        //buoc 3 gui ve api
      await registerService.register({
                username: username,
                email: email,
                encryptedPassword: encryptedPassword,
                phone: phone
            });


      toast.success("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      // Xử lý lỗi trả về từ server (Validation error hoặc lỗi chung)
      const responseData = axiosError.response?.data;
      
      if (responseData && Array.isArray(responseData)) {
          // Nếu server trả về mảng lỗi
        //   responseData.forEach((err: any) => toast.error(typeof err === 'string' ? err : err.errorMessage));
      } else {
          // Nếu lỗi đơn lẻ
          const msg = responseData?.message || "Đăng ký thất bại!";
          toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 border border-gray-100">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Tạo tài khoản
            </h1>
            <p className="text-sm text-gray-500">
              Tham gia DigiBank để trải nghiệm dịch vụ.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Phone Number (MỚI THÊM) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                  placeholder="0912xxxxxx"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                  placeholder="Mật khẩu mạnh (Có chữ hoa, số)"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CheckCircle size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/30 mt-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Đang đăng ký...
                </span>
              ) : (
                "ĐĂNG KÝ NGAY"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-4">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-bold text-green-600 hover:text-green-500 hover:underline transition-colors">
              Đăng nhập tại đây
            </Link>
          </div>
          
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    </AnimatedPage>
  );
};

export default RegisterPage;
  
