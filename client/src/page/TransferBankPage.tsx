import { useRef, useState } from "react";
import type { APIResponse } from "../types";
import { AxiosError } from "axios";
import JSEncrypt from "jsencrypt";
import { transferService } from "../services/transferService";
import { toast } from "react-toastify";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";

const TransferBankPage = () => {
  const requestId = useRef<string>(crypto.randomUUID());
  const { user } = useAuth();

  const [showResetPin, setShowResetPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  // --- STATE FORM ---
  const [receiverAccount, setReceiverAccount] = useState("");
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  const [amount, setAmount] = useState<number | string>("");
  const [description, setDescription] = useState("");
  const [pinForm, setPinForm] = useState(""); // Nhập PIN trực tiếp
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (value: number | string) => {
    if (!value) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };
  const handleResetPin = async () => {
    // if (newPin !== confirmPin) return;
    // try {
    //   await axiosClient.post("/pin/reset", {
    //     newPin,
    //   });
    //   alert("Tạo mã PIN mới thành công");
    //   setShowResetPin(false);
    //   setNewPin("");
    //   setConfirmPin("");
    // } catch (error) {
    //   alert("Không thể tạo mã PIN mới, vui lòng thử lại");
    // }
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
      console.log("Lỗi tìm tài khoản", axiosError);
    } finally {
      setIsCheckingName(false);
    }
  };

  // --- LOGIC XỬ LÝ CHUYỂN TIỀN (GỘP) ---
  const handlerTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate
    if (!receiverName) {
      toast.error("Vui lòng kiểm tra lại tài khoản thụ hưởng");
      return;
    }
    if (Number(amount) < 1000) {
      toast.error("Số tiền tối thiểu là 1,000 VND");
      return;
    }
    if (pinForm.length < 6) {
      toast.warning("Vui lòng nhập đủ 6 số PIN");
      return;
    }

    setIsLoading(true);
    try {
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
      const result = await transferService.transfer({
        ReceiverAccountNumber: receiverAccount,
        AmountMoney: Number(amount),
        Description: description,
        Pin: encryptedPin,
        Types: "Transfer",
        requestId: requestId.current,
      });

      // 4. Thành công -> Reset Form
      toast.success(result.message);
      setPinForm("");
      setAmount("");
      setDescription("");
      setReceiverAccount("");
      setReceiverName(null);
      requestId.current = crypto.randomUUID();
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast.error(axiosError.response?.data.message || "Giao dịch thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800">
      <Header />
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Chuyển Tiền Ngân Hàng
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form onSubmit={handlerTransfer} className="space-y-6">
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Nội dung chuyển tiền
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Chuyen tien..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* PIN INPUT TRỰC TIẾP */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Mã PIN xác thực
                </label>
                <div className="relative max-w-xs">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={pinForm}
                    onChange={(e) => setPinForm(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all tracking-[0.5em] font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetPin(true)}
                  className="text-sm text-blue-600 hover:underline mt-1"
                >
                  Quên mã PIN?
                </button>
              </div>
              {showResetPin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                    {/* Header */}
                    <h2 className="text-lg font-bold text-slate-800 mb-4">
                      Tạo mã PIN mới
                    </h2>

                    {/* PIN mới */}
                    <div className="space-y-2 mb-4">
                      <label className="text-sm font-semibold text-slate-700">
                        Mã PIN mới
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-4 py-3 bg-slate-50 border rounded-lg tracking-[0.5em] font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Xác nhận PIN */}
                    <div className="space-y-2 mb-6">
                      <label className="text-sm font-semibold text-slate-700">
                        Xác nhận mã PIN
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-4 py-3 bg-slate-50 border rounded-lg tracking-[0.5em] font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* Action */}
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowResetPin(false)}
                        className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
                      >
                        Hủy
                      </button>

                      <button
                        onClick={handleResetPin}
                        disabled={newPin.length !== 6 || newPin !== confirmPin}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-lg text-white font-bold shadow-lg transition-transform active:scale-95 ${
                    isLoading
                      ? "bg-black text-white cursor-wait"
                      : "bg-black text-white hover:bg-white-700 hover:shadow-xl"
                  }`}
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận & Chuyển tiền"}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">Lưu ý an toàn</h3>
              <ul className="text-sm text-blue-900 space-y-2 list-disc pl-4">
                <li>Không chia sẻ mã PIN cho bất kỳ ai.</li>
                <li>
                  Kiểm tra kỹ tên:{" "}
                  <strong>{receiverName || "Chưa xác định"}</strong>
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
    </div>
  );
};
export default TransferBankPage;
