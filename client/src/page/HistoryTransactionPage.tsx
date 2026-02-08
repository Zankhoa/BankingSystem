import { useCallback, useEffect, useState, useRef } from "react";
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Header from "./Header";
import AnimatedPage from "./AnimatedPage";
import { historyService } from "../services/historyService";
import type { TransactionHisoryResponse } from "../types";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Math.abs(amount));
};

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<TransactionHisoryResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [pagee, setPage] = useState(1);
  const pageSizee = 10;

  // 1. STATE CHO TÌM KIẾM
  const [searchTerm, setSearchTerm] = useState("");
  // Dùng Ref để lưu trữ timer của debounce, tránh bị re-render làm mất timer
  const debounceTimer = useRef<number | null>(null);

  // 2. KHỞI TẠO STATE NGÀY THÁNG
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  // 3. HÀM FETCH DATA (Đã thêm SearchTerm gửi lên BE)
  const fetchTransaction = useCallback(
    async (currentSearch: string) => {
      setLoading(true);
      try {
        const result = await historyService.GetHistoryTransaction({
          FromDate: new Date(dateRange.from),
          ToDate: new Date(dateRange.to),
          page: pagee,
          pageSize: pageSizee,
          // Gửi searchTerm lên cho Backend xử lý query LIKE %...%
          SearchData: currentSearch,
        });

        if (result) setTransactions(result);
      } catch (error) {
        console.error("Lỗi fetch:", error);
      } finally {
        setLoading(false);
      }
    },
    [pagee, dateRange.from, dateRange.to],
  );

  // 4. XỬ LÝ DEBOUNCE SEARCH (Cấp độ Senior)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); // Cập nhật UI ngay lập tức

    // Xóa timer cũ nếu người dùng vẫn đang gõ
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Đặt timer mới: Sau 500ms ngừng gõ mới gọi API
    debounceTimer.current = setTimeout(() => {
      setPage(1); // Reset về trang 1 khi tìm kiếm mới
      fetchTransaction(value);
    }, 500);
  };

  // Tự động fetch khi đổi ngày hoặc trang (giữ nguyên searchTerm hiện tại)
  useEffect(() => {
    fetchTransaction(searchTerm);
  }, [pagee, dateRange.from, dateRange.to]); // Không đưa searchTerm vào đây để tránh bị gọi 2 lần khi gõ

  // 5. LỌC TYPE (Tiền vào/ra vẫn có thể lọc nhanh ở FE hoặc BE tùy bạn)
  const filteredData = transactions.filter((trx) => {
    if (filterType === "all") return true;
    return filterType === "receive" ? trx.amountMoney > 0 : trx.amountMoney < 0;
  });

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 antialiased">
        <Header />

        <div className="mt-8 max-w-7xl mx-auto px-4 pb-20 space-y-6">
          {/* TOOLBAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
              {/* Senior Search Box: Không dùng value/onChange thô sơ */}
              <div className="relative w-full lg:w-96 font-medium">
                <FiSearch
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? "text-blue-500 animate-pulse" : "text-slate-400"}`}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm nội dung hoặc mã GD..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm shadow-inner"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              {/* DatePicker */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1.5 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">
                      Từ ngày
                    </span>
                    <input
                      type="date"
                      className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-700"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="w-[1px] h-6 bg-slate-200 mx-3"></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">
                      Đến ngày
                    </span>
                    <input
                      type="date"
                      className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-700"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-t border-slate-50 pt-4 items-center justify-between">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {["all", "receive", "send"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
                      filterType === type
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {type === "all"
                      ? "Tất cả"
                      : type === "receive"
                        ? "Tiền vào"
                        : "Tiền ra"}
                  </button>
                ))}
              </div>
              {searchTerm && (
                <span className="text-[10px] font-bold text-slate-400 italic">
                  Đang tìm kiếm cho: "{searchTerm}"
                </span>
              )}
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 font-black">
                    <th className="px-8 py-5">Thông tin giao dịch</th>
                    <th className="px-8 py-5">Noi dung</th>
                    <th className="px-8 py-5">Trạng thái</th>
                    <th className="px-8 py-5">Ngày thực hiện</th>
                    <th className="px-8 py-5 text-right">Biến động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading && transactions.length === 0 ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-8 py-8">
                          <div className="h-5 bg-slate-100 rounded-xl w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-40">
                          <FiSearch size={48} />
                          <p className="font-bold text-slate-500 italic">
                            Không tìm thấy giao dịch nào phù hợp
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((trx, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/50 transition-all cursor-default group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-2xl ${trx.amountMoney > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"} transition-transform group-hover:scale-110 shadow-sm`}
                            >
                              {trx.amountMoney > 0 ? (
                                <FiArrowDownLeft size={20} />
                              ) : (
                                <FiArrowUpRight size={20} />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {trx.userReceveir}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-1 bg-slate-100 px-2 py-0.5 rounded w-fit italic">
                                #{trx.code}
                              </div>
                            </div>
                          </div>
                        </td>{" "}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="text-sm  text-slate-800 group-hover:text-blue-600 transition-colors">
                              {trx.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border shadow-sm ${
                              trx.status === "SUCCESS"
                                ? "bg-white text-emerald-600 border-emerald-100"
                                : "bg-white text-amber-600 border-amber-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-2 ${trx.status === "SUCCESS" ? "bg-emerald-500" : "bg-amber-500 animate-ping"}`}
                            ></span>
                            {trx.status === "SUCCESS" ? "SUCCESS" : "PENDING"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-sm text-slate-700 font-bold">
                            {new Date(trx.createAt).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {new Date(trx.createAt).toLocaleTimeString(
                              "vi-VN",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span
                            className={`font-mono font-black text-base ${trx.amountMoney > 0 ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {trx.amountMoney > 0 ? "+" : "-"}
                            {formatCurrency(trx.amountMoney)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-white">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Page {pagee} Overview
              </span>
              <div className="flex gap-4">
                <button
                  disabled={pagee === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-3 border border-slate-100 rounded-2xl hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="p-3 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-90"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default TransactionHistory;
