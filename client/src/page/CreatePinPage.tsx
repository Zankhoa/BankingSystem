// export default TransferPage;
import { useState } from "react";
import Header from "./Header"; // Sử dụng lại Header cũ
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "./AnimatedPage";
import { authService } from "../services/authService";
import JSEncrypt from "jsencrypt";
import { useAuth } from "../context/AuthContext";
const CreatePinPage = () => {
  // --- STATE ---
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmTouched, setIsConfirmTouched] = useState(false);
  const { user } = useAuth();
  
  const navigate = useNavigate();
  const handleConfirmBlur = () => {
    setIsConfirmTouched(true);
  };
  // Hàm xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate độ dài
    if (pin.length < 6) {
      toast.error("Mã PIN phải đủ 6 chữ số");
      return;
    }

    // 2. Validate độ khớp
    if (pin !== confirmPin) {
      toast.error("Mã PIN nhập lại không khớp");
      return;
    }

    setIsLoading(true);
    try {
      // --- Gọi API tạo PIN ở đây ---
      // const encryptedPin = encrypt(pin); ...
      // await userService.createPin(encryptedPin);
      // B1: Lấy RSA Key
      const keyData = await authService.getPublicKey();
      // B2: Mã hóa password
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(keyData.publicKey);
      const encryptedPassword = encryptor.encrypt(password);
      const encryptedPin = encryptor.encrypt(pin);

      if (!encryptedPassword || !encryptedPin) {
        toast.error("Lỗi mã hóa. Vui lòng thử lại.");
        return;
      }

        await authService.createPinUser({
        PinHash: encryptedPin,
        PasswordHash: encryptedPassword,
      });
      if (user?.hasPin === true) {
        toast.success("Tạo mã PIN thành công!");
        
        // Đợi 1.5 giây để người dùng kịp nhìn thấy thông báo thành công
        setTimeout(() => {
          navigate("/transfer/internal");
        }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-white font-sans text-slate-900">
        {/* Header đen */}
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Tiêu đề trang đổi thành Tạo PIN */}
          <div className="mb-10 border-b border-slate-100 pb-4">
            <h1 className="text-3xl font-bold text-slate-900">
              Thiết Lập Mã PIN
            </h1>
          </div>

          {/* GIỮ NGUYÊN CẤU TRÚC GRID 2 CỘT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* --- CỘT TRÁI: FORM NHẬP PIN (Chiếm 2/3) --- */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Input 1: Mã PIN mới */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Mã PIN mới (6 số)
                  </label>
                  <div className="relative">
                    {/* Icon Ổ khóa */}
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={pin}
                      // Chỉ cho nhập số
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value))
                          setPin(e.target.value);
                      }}
                      placeholder="••••••"
                      // Style y hệt input trang trước
                      className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-slate-400 tracking-widest font-bold"
                    />
                  </div>
                </div>

                {/* Input 2: Nhập lại PIN */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Nhập lại mã PIN
                  </label>
                  <div className="relative">
                    {/* ... Icon ổ khóa giữ nguyên ... */}

                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={confirmPin}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value))
                          setConfirmPin(e.target.value);
                      }}
                      // 👇 THÊM DÒNG NÀY
                      onBlur={handleConfirmBlur}
                      placeholder="••••••"
                      className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-slate-400 tracking-widest font-bold"
                    />
                  </div>

                  {/* 👇 SỬA ĐIỀU KIỆN HIỂN THỊ LỖI Ở ĐÂY */}
                  {isConfirmTouched && confirmPin && pin !== confirmPin && (
                    <p className="text-xs text-red-500 mt-1 ml-1 animate-pulse">
                      Mã PIN nhập lại không khớp.
                    </p>
                  )}
                </div>

                {/* Input 1: Mật Khẩu */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Mật Khẩu
                  </label>
                  <div className="relative">
                    {/* Icon Ổ khóa */}
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      value={password}
                      // Chỉ cho nhập số
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      // Style y hệt input trang trước
                      className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-slate-400 tracking-widest font-bold"
                    />
                  </div>
                </div>

                {/* Button Action (Màu đen) */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || pin.length < 6 || pin !== confirmPin}
                    className="w-full py-3.5 bg-black text-white font-bold rounded-lg shadow-lg hover:bg-gray-800 transition-transform active:scale-[0.99] flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Đang xử lý..." : "Xác nhận & Tạo PIN"}
                  </button>
                </div>
              </form>
            </div>

            {/* --- CỘT PHẢI: SIDEBAR (Giữ nguyên style, đổi nội dung) --- */}
            <div className="lg:col-span-1 space-y-6">
              {/* Box Xanh: Lưu ý an toàn */}
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                <h3 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">
                  Lưu ý bảo mật
                </h3>
                <ul className="text-sm text-blue-900 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>
                    Tuyệt đối không chia sẻ mã PIN cho bất kỳ ai, kể cả nhân
                    viên ngân hàng.
                  </li>
                  <li>
                    Không đặt PIN dễ đoán như ngày sinh, số điện thoại hoặc dãy
                    số liên tiếp (123456).
                  </li>
                </ul>
              </div>

              {/* Box Cam: Lời khuyên */}
              <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
                <h3 className="font-bold text-orange-800 mb-3 text-sm uppercase tracking-wide">
                  Lời khuyên
                </h3>
                <p className="text-sm text-orange-900 leading-relaxed">
                  Bạn nên thay đổi mã PIN định kỳ 3-6 tháng một lần để tăng
                  cường bảo mật cho tài khoản.
                </p>
              </div>
            </div>
          </div>
        </main>
        <ToastContainer />
      </div>
    </AnimatedPage>
  );
};

export default CreatePinPage;
