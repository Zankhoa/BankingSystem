// import React, { useState, useEffect, useMemo } from "react";
// import { ArrowRight, TrendingUp, Activity, RefreshCw } from "lucide-react";

// // --- TYPES ---
// interface ExchangeRates {
//   [key: string]: number;
// }

// // --- SERVICE ---
// const fetchExchangeRates = async (): Promise<ExchangeRates | null> => {
//   try {
//     const res = await fetch("https://open.er-api.com/v6/latest/USD");
//     const data = await res.json();
//     return data.rates;
//   } catch (error) {
//     console.error("Lỗi lấy tỷ giá:", error);
//     return null;
//   }
// };

// // --- ALGORITHM ---
// const predictNextMonthSpending = (historyData: number[]) => {
//   if (!historyData || historyData.length === 0) return 0;
//   const weights = [0.2, 0.3, 0.5]; 
//   let prediction = 0;
  
//   historyData.forEach((amount, index) => {
//      prediction += amount * (weights[index] || 0);
//   });

//   return prediction * 1.05; 
// };

// const FinancialWidgets = () => {
//   const [rates, setRates] = useState<ExchangeRates | null>(null);
//   const [amountVND, setAmountVND] = useState<number>(10000000); 
//   const [isLoading, setIsLoading] = useState<boolean>(true);

//   const spendingHistory = [9800000, 12500000, 10329000]; 
//   const nextMonthPrediction = predictNextMonthSpending(spendingHistory);

//   useEffect(() => {
//     const getData = async () => {
//       setIsLoading(true);
//       const rateData = await fetchExchangeRates();
//       setRates(rateData);
//       setIsLoading(false);
//     };
//     getData();
//   }, []);

//   const convertedUSD = useMemo(() => {
//     if (!rates) return 0;
//     const usdRate = rates.VND; 
//     const rawUSD = amountVND / usdRate;
//     const fee = rawUSD * 0.02; 
//     return rawUSD - fee;
//   }, [rates, amountVND]);

//   const formatUSD = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
//   const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//       {/* WIDGET 1 */}
//       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="font-bold text-slate-800 flex items-center gap-2">
//             <RefreshCw size={18} className="text-blue-600"/> Quy đổi ngoại tệ (Live)
//           </h3>
//           <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">Phí: 2%</span>
//         </div>

//         <div className="space-y-4">
//            <div>
//               <label className="text-xs text-slate-500 font-bold mb-1 block">Số tiền (VND)</label>
//               <div className="relative">
//                  <input 
//                     type="number" 
//                     value={amountVND}
//                     onChange={(e) => setAmountVND(Number(e.target.value))}
//                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-blue-500"
//                  />
//                  <span className="absolute right-4 top-3 text-slate-400 text-sm font-bold">🇻🇳 VND</span>
//               </div>
//            </div>

//            <div className="flex justify-center -my-2 relative z-10">
//               <div className="bg-white border border-slate-200 p-2 rounded-full text-slate-400 shadow-sm">
//                  <ArrowRight size={16} className="rotate-90 md:rotate-0"/>
//               </div>
//            </div>

//            <div>
//               <label className="text-xs text-slate-500 font-bold mb-1 block">Thực nhận (USD)</label>
//               <div className="relative">
//                  <div className="w-full p-3 bg-blue-50 border border-blue-100 rounded-lg font-bold text-blue-700 text-xl">
//                     {isLoading ? "Loading..." : formatUSD(convertedUSD)}
//                  </div>
//                  <span className="absolute right-4 top-3 text-blue-400 text-sm font-bold">🇺🇸 USD</span>
//               </div>
//               <p className="text-xs text-slate-400 mt-2 text-right">
//                  1 USD ≈ {rates ? formatVND(rates.VND) : "..."} VND
//               </p>
//            </div>
//         </div>
//       </div>

//       {/* WIDGET 2 */}
//       <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg text-white relative overflow-hidden">
//         <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
//         <div className="relative z-10 h-full flex flex-col justify-between">
//            <div>
//               <div className="flex justify-between items-start mb-6">
//                  <div>
//                     <h3 className="font-bold text-lg flex items-center gap-2">
//                        <Activity size={20} className="text-purple-400"/> AI Phân Tích
//                     </h3>
//                     <p className="text-slate-400 text-sm">Dự báo dòng tiền tháng sau</p>
//                  </div>
//                  <div className="bg-purple-500/20 px-3 py-1 rounded-full text-xs font-bold text-purple-300 border border-purple-500/30">
//                     BETA
//                  </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4 mb-6">
//                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
//                     <p className="text-xs text-slate-400 mb-1">Trung bình 3 tháng</p>
//                     <p className="text-lg font-bold text-slate-200">
//                        {formatVND(spendingHistory.reduce((a,b)=>a+b,0)/3)} ₫
//                     </p>
//                  </div>
//                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
//                     <p className="text-xs text-slate-400 mb-1">Xu hướng</p>
//                     <p className="text-lg font-bold text-red-400 flex items-center gap-1">
//                        <TrendingUp size={16}/> Tăng nhẹ
//                     </p>
//                  </div>
//               </div>
//            </div>

//            <div className="pt-4 border-t border-white/10">
//               <p className="text-sm text-slate-400 mb-1">Dự báo chi tiêu Tháng 11</p>
//               <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
//                  {formatVND(nextMonthPrediction)} ₫
//               </h2>
//               <p className="text-[10px] text-slate-500 mt-2 italic">
//                  *Mô hình Weighted Moving Average với hệ số rủi ro 5%.
//               </p>
//            </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FinancialWidgets;