import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Wallet,
  PieChart as MoreHorizontal,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import DateRangePicker from "./DatePicker";
import { dashboardService } from "../services/dashboardService";
import type { GetDataChartResponse, TotalMoneyResponse, TransactionHisoryDashboardResponse } from "../types";
import CustomTooltip from "./CustomTooltip";

// --- INTERFACES ---
interface StatCardProps {
  label: string;
  value: React.ReactNode;
  loading: boolean;
  type?: "default" | "in" | "out";
}

interface DateRange {
  from: Date | null;
  to: Date | null;
}

// --- COMPONENTS ---
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
);

const StatCard = ({ label, value, loading, type = "default" }: StatCardProps) => {
  const valueColors = {
    default: "text-slate-900",
    in: "text-emerald-600",
    out: "text-rose-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-32 mb-2" />
      ) : (
        <h3 className={`text-2xl font-bold tracking-tight ${valueColors[type]}`}>
          {value}
        </h3>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [historyTransaction, setHistoryTransaction] = useState<TransactionHisoryDashboardResponse[]>([]);
  const [stats, setStats] = useState<TotalMoneyResponse>({
    moneyIn: 0,
    moneyOut: 0,
    totalMoney: 0,
  });
  const [chartData, setChartData] = useState<GetDataChartResponse[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const requestData = {
          FromDate: dateRange.from || undefined,
          ToDate: dateRange.to || undefined,
        };

        const [TotalMoney, DataChart, HistoryTrans] = await Promise.all([
          dashboardService.GetDataMoney(requestData),
          dashboardService.GetDataChart(requestData),
          dashboardService.GetHistoryTransaction(requestData),
        ]);
        
        setStats(TotalMoney);
        setHistoryTransaction(HistoryTrans);
        setChartData(DataChart);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  // --- HELPERS ---
  const formatMoneyChart = (val: number) => {
    if (val === 0) return "0";
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return `${(val / 1000).toFixed(0)}k`;
  };
  const navigate = useNavigate();
  const formatMoney = (num: number) =>
    new Intl.NumberFormat("vi-VN").format(Math.abs(num));
    
  const formatDateDisplay = (date: Date | null) =>
    date ? date.toLocaleDateString("vi-VN") : "...";

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <Header />
      <main className="max-w-7xl mx-auto px-4 pt-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tổng quan tài chính</h1>
            <p className="text-slate-500 text-sm mt-1">
              {isLoading
                ? "Đang đồng bộ dữ liệu..."
                : `Dữ liệu từ: ${formatDateDisplay(dateRange.from)} - ${formatDateDisplay(dateRange.to)}`}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={16} /> <span className="hidden sm:inline">Xuất Báo Cáo</span>
            </button>
            <DateRangePicker range={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* STATS CARDS - CẬP NHẬT MÀU XANH/ĐỎ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Tổng tài sản thực tế"
            value={`${formatMoney(stats.totalMoney)} ₫`}
            loading={isLoading}
          />
          <StatCard
            label="Dòng tiền vào"
            value={`+${formatMoney(stats.moneyIn)} ₫`}
            loading={isLoading}
            type="in"
          />
          <StatCard
            label="Đã chi tiêu"
            value={`-${formatMoney(stats.moneyOut)} ₫`}
            loading={isLoading}
            type="out"
          />
        </div>

        {/* CHARTS & HISTORY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: BIỂU ĐỒ BIẾN ĐỘNG */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-bold flex items-center gap-2 text-lg">
                    <Wallet size={20} className="text-indigo-500" />
                    Biến động dòng tiền
                  </h3>
                  <p className="text-xs text-slate-400 ml-7">So sánh thu nhập và chi tiêu</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-600">Tiền vào</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-semibold text-slate-600">Tiền ra</span>
                  </div>
                </div>
              </div>

              <div className="h-[320px] w-full">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl">
                    <Loader2 className="animate-spin text-indigo-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <defs>
                        {/* Gradient Xanh cho Tiền vào */}
                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        {/* Gradient Đỏ cho Tiền ra */}
                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#94a3b8", fontSize: 12 }} 
                        dy={15} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#94a3b8", fontSize: 12 }} 
                        tickFormatter={formatMoneyChart} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
                      
                      {/* Đường Tiền ra (Màu Đỏ) */}
                      <Area
                        name="Tiền ra"
                        type="monotone"
                        dataKey="moneyOut"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fill="url(#colorOut)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: "#f43f5e" }}
                      />
                      {/* Đường Tiền vào (Màu Xanh) */}
                      <Area
                        name="Tiền vào"
                        type="monotone"
                        dataKey="moneyIn"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#colorIn)"
                        dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: LỊCH SỬ GIAO DỊCH */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
              <div className="px-4 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-800">Lịch sử giao dịch</h3>
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full">Mới nhất</span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[600px] p-2 custom-scrollbar">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 mb-2">
                      <div className="flex gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="w-24 h-3" />
                          <Skeleton className="w-16 h-2" />
                        </div>
                      </div>
                      <Skeleton className="w-20 h-4" />
                    </div>
                  ))
                ) : historyTransaction.length > 0 ? (
                  historyTransaction.map((tx) => {
                    const isPositive = tx.amountMoney > 0;
                    return (
                      <div
                        key={tx.code}
                        className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                              isPositive
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                : "bg-rose-50 border-rose-100 text-rose-500"
                            }`}
                          >
                            {isPositive ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-900 break-words pr-2 line-clamp-1">
                              {tx.usersTransaction}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-slate-500">{formatDateTime(tx.createAt)}</span>
                              {tx.status === "SUCCESS" && <CheckCircle2 size={10} className="text-emerald-500" />}
                            </div>
                          </div>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <span className={`block text-sm font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPositive ? "+" : "-"} {formatMoney(tx.amountMoney)} ₫
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">Không tìm thấy giao dịch nào</div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 text-center bg-slate-50 rounded-b-xl">
                <button onClick={() => navigate("/history")} className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto transition-colors">
                  Xem tất cả <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;