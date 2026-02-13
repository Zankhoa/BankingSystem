import { useEffect, useRef, useState } from "react";
import type { APIResponse } from "../types";
import { AxiosError } from "axios";
import JSEncrypt from "jsencrypt";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "./AnimatedPage";
import { externalService } from "../services/exernalService";

const TransferExternalPage = () => {
  const requestId = useRef<string>(crypto.randomUUID());
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STATE FORM ---
  const [receiverAccount, setReceiverAccount] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [description, setDescription] = useState("");
  const [pinForm, setPinForm] = useState("");
  
  // --- STATE UI ---
  const [showRequirePinModal, setShowRequirePinModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.hasPin === false) {
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

  const handlePreCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receiverAccount) {
      toast.error("Vui lòng nhập tài khoản người nhận");
      return;
    }
    
    const amountVal = Number(amount);
    if (!amountVal || amountVal < 1000) {
      toast.error("Số tiền tối thiểu là 1,000 đ");
      return;
    }

    if (user?.accountNumber === receiverAccount) {
      toast.error("Không thể chuyển tiền cho chính mình");
      return;
    }

    if (amountVal > Number(user?.balance || 0)) {
      toast.error("Số dư không đủ");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalTransferr = async () => {
    if (pinForm.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số PIN");
      return;
    }

    setIsLoading(true);
    try {
      const keyData = await externalService.getPublicKey();
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(keyData.publicKey);
      const encryptedPin = encryptor.encrypt(pinForm);

      if (!encryptedPin) {
        toast.error("Lỗi mã hóa bảo mật");
        return;
      }

      await externalService.transferExternal({
        ReceiverAccountNumber: receiverAccount,
        AmountMoney: Number(amount),
        Pin: encryptedPin,
        RequestId: requestId.current,
      });

      toast.success("Giao dịch thành công!");
      
      // Reset form
      setShowConfirmModal(false);
      setAmount("");
      setPinForm("");
      setDescription("");
      setReceiverAccount("");
      requestId.current = crypto.randomUUID(); // Reset request ID cho lần sau
      
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast.error(axiosError.response?.data.message || "Giao dịch thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-white font-sans text-slate-900">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-10 border-b border-slate-100 pb-4">
            <h1 className="text-3xl font-bold text-slate-900">Chuyển Tiền Liên Ngân Hàng</h1>
          </div>

          {/* Modal Yêu cầu PIN */}
          {showRequirePinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
              <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 pt-6 pb-2">
                  <h3 className="text-xl font-bold text-slate-900">Chưa thiết lập mã PIN</h3>
                </div>
                <div className="px-6 py-2">
                  <p className="text-sm text-slate-600">Để bảo vệ tài khoản, bạn cần có mã PIN 6 số trước khi giao dịch.</p>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <button onClick={() => navigate("/transfer/register-pin")} className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 text-sm">
                    Tạo mã PIN ngay
                  </button>
                  <button onClick={() => navigate("/")} className="w-full py-3 bg-white text-slate-700 font-bold rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">
                    Hủy & Quay về
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <form onSubmit={handlePreCheck} className="space-y-6">
                {/* Số dư */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Số dư khả dụng</label>
                  <input
                    type="text"
                    readOnly
                    value={formatCurrency(user?.balance || 0)}
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-bold outline-none"
                  />
                </div>

                {/* Tài khoản nhận - FIXED HERE */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tài khoản thụ hưởng</label>
                  <input
                    type="text"
                    required
                    value={receiverAccount}
                    onChange={(e) => setReceiverAccount(e.target.value)}
                    placeholder="Nhập số tài khoản người nhận"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
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

                {/* Nội dung chuyển tiền - NEW */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nội dung (không bắt buộc)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập nội dung chuyển tiền"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    rows={2}
                  />
                </div>

                <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-lg shadow-lg hover:bg-gray-800 transition-all">
                  Tiếp tục & Kiểm tra
                </button>
              </form>
            </div>

            {/* Sidebar thông tin */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2">Thông tin nhận</h3>
                <p className="text-sm text-blue-900">Tài khoản: <span className="font-bold">{receiverAccount || "Chưa nhập"}</span></p>
                <p className="text-sm text-blue-900 mt-2 italic">* Vui lòng kiểm tra kỹ số tài khoản trước khi xác nhận.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Modal Xác nhận & Nhập PIN */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gray-900 p-4 text-white text-center">
                <h3 className="text-lg font-bold uppercase tracking-wider">Xác nhận giao dịch</h3>
              </div>

              <div className="p-6 space-y-5">
                <div className="text-center pb-4 border-b border-dashed border-gray-300">
                  <p className="text-gray-500 text-xs font-semibold">TỔNG SỐ TIỀN</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(amount)}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tài khoản nhận</span>
                    <span className="font-bold text-gray-800">{receiverAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nội dung</span>
                    <span className="font-medium text-gray-800">{description || "Chuyển tiền liên ngân hàng"}</span>
                  </div>
                </div>

                <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-center text-sm font-bold text-slate-700 mb-3">Nhập mã PIN để xác nhận</label>
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    value={pinForm}
                    onChange={(e) => setPinForm(e.target.value)}
                    className="w-full text-center py-2 bg-white border border-slate-300 rounded-lg text-2xl tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button onClick={() => setShowConfirmModal(false)} className="py-3 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                    Quay lại
                  </button>
                  <button
                    onClick={handleFinalTransferr}
                    disabled={isLoading || pinForm.length < 6}
                    className={`py-3 rounded-lg text-white font-bold ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    {isLoading ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </AnimatedPage>
  );
};

export default TransferExternalPage;