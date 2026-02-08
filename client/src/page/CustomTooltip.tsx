/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
        <p className="text-[11px] font-bold text-slate-400 uppercase mb-2 tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 py-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-slate-600 font-medium">{entry.name}:</span>
            <span className="text-sm font-bold text-slate-900">
              {new Intl.NumberFormat("vi-VN").format(entry.value)} ₫
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
export default CustomTooltip;