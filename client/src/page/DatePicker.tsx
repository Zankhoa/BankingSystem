import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, ArrowRight } from "lucide-react";

// --- HELPERS ---
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const isSameDay = (d1: Date, d2: Date) => 
  d1.getDate() === d2.getDate() && 
  d1.getMonth() === d2.getMonth() && 
  d1.getFullYear() === d2.getFullYear();

const isDateBetween = (date: Date, start: Date, end: Date) => {
  return date > start && date < end;
};

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangePickerProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ range, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date()); 
  const containerRef = useRef<HTMLDivElement>(null);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    clickedDate.setHours(0, 0, 0, 0);

    if (!range.from || (range.from && range.to)) {
      onChange({ from: clickedDate, to: null });
    } else if (range.from && clickedDate > range.from) {
      onChange({ ...range, to: clickedDate });
      setIsOpen(false);
    } else {
      onChange({ from: clickedDate, to: null });
    }
  };

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const startDayIndex = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) === 0 ? 6 : getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) - 1;

  // Format ngày đẹp hơn (dd/MM/yyyy)
  const formatDate = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="relative" ref={containerRef}>
      
      {/* --- NÚT TRIGGER (GIAO DIỆN MỚI) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all shadow-sm border min-w-[280px] bg-white
        ${isOpen 
            ? "border-slate-900 ring-1 ring-slate-900 shadow-md" 
            : "border-slate-200 hover:border-slate-300 hover:shadow"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Icon lịch có nền */}
          <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
             <CalendarIcon size={16} />
          </div>

          {/* Phần hiển thị text */}
          <div className="flex flex-col items-start">
             <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider"></span>
             <div className="flex items-center gap-2 text-slate-700 font-semibold">
                {range.from ? (
                    <>
                        <span>{formatDate(range.from)}</span>
                        <ArrowRight size={12} className="text-slate-400"/>
                        <span className={!range.to ? "text-slate-300" : ""}>
                            {range.to ? formatDate(range.to) : "Chọn ngày..."}
                        </span>
                    </>
                ) : (
                    <span className="text-slate-500 font-normal">Chọn khoảng ngày</span>
                )}
             </div>
          </div>
        </div>
        
        {/* Nút Xóa (Clear) */}
        {range.from && (
          <div 
            onClick={(e) => { 
              e.stopPropagation(); 
              onChange({from: null, to: null}); 
            }} 
            className="hover:bg-slate-100 rounded-full p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
            title="Xóa bộ lọc"
          >
             <X size={14}/>
          </div>
        )}
      </button>

      {/* --- POPUP LỊCH (GIỮ NGUYÊN STYLE CŨ VÌ ĐÃ ĐẸP) --- */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[320px] bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-5 px-1">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-500 hover:text-slate-900"><ChevronLeft size={20} /></button>
            <span className="font-bold text-slate-800 text-base">Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}</span>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-500 hover:text-slate-900"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 mb-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d} className="py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-y-1 relative">
            {Array.from({ length: startDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              date.setHours(0,0,0,0);
              const isStart = range.from && isSameDay(date, range.from);
              const isEnd = range.to && isSameDay(date, range.to);
              const isInRange = range.from && range.to && isDateBetween(date, range.from, range.to);

              let buttonClass = "h-9 w-full flex items-center justify-center text-sm relative transition-all z-10 ";
              if (isStart && isEnd) buttonClass += "bg-slate-900 text-white rounded-full font-bold shadow-md";
              else if (isStart) buttonClass += "bg-slate-900 text-white rounded-l-full font-bold shadow-md";
              else if (isEnd) buttonClass += "bg-slate-900 text-white rounded-r-full font-bold shadow-md";
              else if (isInRange) buttonClass += "bg-slate-100 text-slate-900 font-medium rounded-none";
              else buttonClass += "text-slate-700 hover:bg-slate-50 rounded-full hover:text-slate-900";

              return (
                <div key={day} className="relative p-[1px]">
                    <button onClick={() => handleDayClick(day)} className={buttonClass}>{day}</button>
                    {(isStart && range.to) && <div className="absolute top-[1px] bottom-[1px] right-0 w-1/2 bg-slate-100 z-0" />}
                    {(isEnd && range.from) && <div className="absolute top-[1px] bottom-[1px] left-0 w-1/2 bg-slate-100 z-0" />}
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 text-center">
             <span className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full">
                {range.from && !range.to ? "Chọn ngày kết thúc..." : range.from && range.to ? "Đã chọn xong" : "Chọn khoảng thời gian"}
             </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;