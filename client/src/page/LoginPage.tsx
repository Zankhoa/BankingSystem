import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {authService} from "../services/authService";
import type { APIResponse } from '../types'; // Import type kết quả trả về của bạn
import { AxiosError } from 'axios'; // Import cái này
import { useAuth } from '../context/AuthContext';
const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isAuthenticated } = useAuth(); // Lấy hàm login từ Context
    const navigate = useNavigate();
    
    if(isAuthenticated){
        return <Navigate to="/atm" />;
    }
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try{

            //1 goi api login
            const data = await authService.login(username, password);
            //2 cap nhan context se dc tu luu vao storegarge
            login(data.token, data.accountId);
             toast.success("Login successful!");

            //3 dieu huong ve trang atm
            navigate("/atm");
        } catch (error){
            const axiosError = error as AxiosError<APIResponse>;
           toast.error(axiosError.response?.data.message || "Login failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
};
return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
            <div style={{ padding: '30px', border: '1px solid #ccc', borderRadius: '8px', width: '350px' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>🔐 DigiBank Login</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" placeholder="Username" 
                        value={username} onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <input 
                        type="password" placeholder="Password" 
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
};
export default LoginPage;