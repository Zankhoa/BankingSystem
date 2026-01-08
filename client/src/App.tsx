import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS thông báo
import { atmService } from './services/atmService';
import { AxiosError } from 'axios'; // Import cái này từ thư viện axios
import type { APIResponse } from './types'; // Import type kết quả trả về của bạn

function App() {
  const [accountId, setAccountId] = useState<string>("1"); // Mặc định ID 1
  const [amount, setAmount] = useState<number>(50000);   // Mặc định 50k
  const [isLoading, setIsLoading] = useState(false);
const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn reload trang
    
    if (amount <= 0) {
      toast.error("Số tiền phải lớn hơn 0!");
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API
      const result = await atmService.withdraw({ accountId, amount });
      
      // Thành công
      toast.success(result.message); 
      console.log("Kết quả:", result);
    } catch (error) {
      const err = error as AxiosError<APIResponse>;
      // Thất bại
      const message = err.response?.data?.error || "Có lỗi xảy ra!";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>🏦 DigiBank ATM</h1>
      
      <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label>Mã Tài Khoản:</label>
          <input 
            type="string" 
            value={accountId}
            onChange={(e) => setAccountId(String(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label>Số tiền muốn rút:</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '10px', 
            backgroundColor: isLoading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Đang xử lý...' : 'RÚT TIỀN NGAY'}
        </button>

      </form>

      {/* Nơi hiện thông báo popup */}
      <ToastContainer position="top-center" />
    </div>
  );
}

export default App;