import { useEffect, useRef, useState } from "react";
import type { APIResponse } from "../types";
import { AxiosError } from "axios";
import JSEncrypt from "jsencrypt";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { transferService } from "../services/transferService";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "./AnimatedPage";

const TransferPage = () => {
  const requestId = useRef<string>(crypto.randomUUID());
  const { user } = useAuth();

  // --- STATE FORM ---
  const [receiverAccount, setReceiverAccount] = useState("");
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [showRequirePinModal, setShowRequirePinModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [amount, setAmount] = useState<number | string>("");
  const [description, setDescription] = useState("");
  const [pinForm, setPinForm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra ngay khi vào trang
    if (user?.hasPin === false) {
      // Thay vì chuyển trang ngay, ta hiện Modal
      setShowRequirePinModal(true);
    }
  }, [user]);


  const formatCurrency = (value: number | string) => {
    if (!value) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };

  // --- LOGIC XỬ LÝ TÀI KHOẢN ---
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiverAccount(e.target.value);
    // Hễ sửa số là xóa tên cũ đi
    if (receiverName) setReceiverName(null);
  };

  const handleAccountChangeOnBlur = async () => {
    if (!receiverAccount || receiverAccount.length < 6) return;
    setIsCheckingName(true);
    setReceiverName(null);
    try {
      const data = await transferService.getInfo(receiverAccount);
      setReceiverName(data.userName || data.fullName);
    } catch (error) {
      setReceiverName(null);
      const axiosError = error as AxiosError<APIResponse>;
      console.log("Lỗi tìm tài khoản2", axiosError);
    } finally {
      setIsCheckingName(false);
    }
  };
  // --- LOGIC XỬ LÝ CHUYỂN TIỀN (GỘP) ---
  const handlePreCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!receiverAccount) {
        toast.error("Vui lòng nhập tài khoản người nhận");
        return;
      }
      const amountVal = Number(amount);
      if (!amountVal || amountVal < 1000) {
        toast.error("Số tiền tối thiểu là 1,000 đ");
        return;
      }
      const nub = Number(user?.balance);
      if (amountVal > nub) {
        toast.error("Số dư không đủ");
        return;
      }
      // 4. Thành công -> Reset Form
      setShowConfirmModal(true);
      // toast.success(result.message);
      requestId.current = crypto.randomUUID();
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast.error(axiosError.response?.data.message || "Giao dịch thất bại");
    } finally {
      setIsLoading(false);
    }
  };
  // --- BƯỚC 2: XỬ LÝ GIAO DỊCH (Nút Xác Nhận ở Modal) ---
  const handleFinalTransfer = async () => {
    if (pinForm.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số PIN");
      return;
    }
    setIsLoading(true);
    try {
      // --- LOGIC GỌI API CỦA BẠN ---
      // 2. Lấy Key & Mã hóa PIN
      const keyData = await transferService.getPublicKey();
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(keyData.publicKey);
      const encryptedPin = encryptor.encrypt(pinForm);

      if (!encryptedPin) {
        toast.error("Lỗi mã hóa bảo mật");
        return;
      }

      // 3. Gọi API Transfer
      await transferService.transfer({
        ReceiverAccountNumber: receiverAccount,
        AmountMoney: Number(amount),
        Description: description,
        Pin: encryptedPin,
        Types: "Transfer",
        RequestId: requestId.current,
      });

      // Giả lập delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Giao dịch thành công!");
      // Reset và đóng modal
      setShowConfirmModal(false);
      setAmount("");
      setPinForm("");
      setDescription("");
      setReceiverAccount("");
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      console.log( axiosError);
      toast.error("Giao dịch thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-hidden">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 border-b border-slate-100 pb-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Chuyển Tiền Nội Bộ
          </h1>
        </div>
       {/* --- MODAL YÊU CẦU PIN (STYLE TỐI GIẢN) --- */}
      {showRequirePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          
          {/* Modal Container: Trắng, Bo góc nhẹ, Viền mỏng */}
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Header: Chỉ text đậm, không màu nền */}
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-xl font-bold text-slate-900">
                Chưa thiết lập mã PIN
              </h3>
            </div>

            {/* Body: Text màu xám, dễ đọc */}
            <div className="px-6 py-2">
              <p className="text-sm text-slate-600 leading-relaxed">
                Để bảo vệ tài khoản, bạn bắt buộc phải có mã PIN 6 số trước khi thực hiện giao dịch chuyển tiền.
              </p>
            </div>

            {/* Footer: 2 Nút bấm (Đen & Trắng) */}
            <div className="p-6 flex flex-col gap-3">
              {/* Nút Chính: Màu Đen */}
              <button
                onClick={() => navigate("/transfer/register-pin")}
                className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                Tạo mã PIN ngay
              </button>

              {/* Nút Phụ: Màu Trắng viền Xám */}
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 bg-white text-slate-700 font-bold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors text-sm"
              >
                Hủy & Quay về
              </button>
            </div>

          </div>
        </div>
      )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form onSubmit={handlePreCheck} className="space-y-6">
              {/* User Balance */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Số dư
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={formatCurrency(user?.balance || 0)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-bold focus:outline-none cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Receiver Account */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Tài khoản thụ hưởng
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={receiverAccount}
                    onChange={handleAccountChange}
                    onBlur={handleAccountChangeOnBlur}
                    placeholder="Nhập số tài khoản người nhận"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg focus:bg-white focus:ring-2 focus:border-transparent outline-none transition-all ${receiverName ? "border-green-500 ring-green-100" : "border-slate-300 focus:ring-blue-500"}`}
                  />
                  {isCheckingName && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  )}
                </div>
                {/* Tên người nhận */}
                {receiverName && (
                  <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200 animate-pulse">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span className="font-bold uppercase">{receiverName}</span>
                  </div>
                )}
                {!receiverName &&
                  receiverAccount.length > 0 &&
                  !isCheckingName && (
                    <div className="text-xs text-slate-400 italic pl-1">
                      Nhấn ra ngoài để kiểm tra tên người nhận
                    </div>
                  )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Số tiền giao dịch
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">₫</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold text-lg text-blue-900"
                    placeholder="0"
                  />
                  {amount ? (
                    <span className="absolute right-4 top-3.5 text-sm font-medium text-green-600">
                      {formatCurrency(amount)}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Nội dung chuyển tiền
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Chuyen tien..."
                  className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* NÚT TIẾP TỤC (Thay vì Submit ngay) */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-black text-white font-bold shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  Tiếp tục & Kiểm tra
                </button>
              </div>
            </form>
          </div>

          {/* --- CỘT PHẢI: SIDEBAR --- */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">Lưu ý an toàn</h3>
              <ul className="text-sm text-blue-900 space-y-2 list-disc pl-4">
                <li>Không chia sẻ mã PIN cho bất kỳ ai.</li>
                <li>
                  Kiểm tra kỹ tên: <strong>{receiverName || "..."}</strong>
                </li>
              </ul>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
              <h3 className="font-bold text-orange-800 mb-2">
                Hạn mức giao dịch
              </h3>
              <p className="text-sm text-orange-900">
                Tối đa: <span className="font-bold">500.000.000 ₫</span> / ngày.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL CONFIRM BILL (Bật lên khi nhấn Tiếp tục) --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-white text-center relative">
              <h3 className="text-lg font-bold uppercase tracking-wider">
                Xác nhận giao dịch
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Số tiền to */}
              <div className="text-center pb-4 border-b border-dashed border-gray-300">
                <p className="text-gray-500 text-xs uppercase font-semibold">
                  Tổng số tiền
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {formatCurrency(amount)}
                </p>
              </div>

              {/* Thông tin chi tiết */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Người thụ hưởng</span>
                  <span className="font-bold text-gray-800 uppercase">
                    {receiverName || "Không xác định"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tài khoản</span>
                  <span className="font-medium text-gray-800">
                    {receiverAccount}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 whitespace-nowrap">
                    Nội dung
                  </span>
                  <span className="font-medium text-gray-800 text-right">
                    {description}
                  </span>
                </div>
              </div>

              {/* Ô NHẬP PIN NẰM Ở ĐÂY */}
              <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-center text-sm font-bold text-slate-700 mb-3">
                  Nhập mã PIN để xác nhận
                </label>
                <div className="relative max-w-[200px] mx-auto">
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    value={pinForm}
                    onChange={(e) => setPinForm(e.target.value)}
                    placeholder="••••••"
                    className="w-full text-center py-2 bg-white border border-slate-300 rounded-lg text-2xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleFinalTransfer}
                  disabled={isLoading || pinForm.length < 6}
                  className={`py-3 rounded-lg text-white font-bold shadow-md ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>

            {/* Răng cưa trang trí */}
            <div
              className="h-4 bg-slate-100 relative"
              style={{
                background:
                  "radial-gradient(circle, transparent 50%, white 50%)",
                backgroundSize: "10px 10px",
                backgroundPosition: "0 5px",
              }}
            ></div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
    </AnimatedPage>
  );
};
export default TransferPage;
