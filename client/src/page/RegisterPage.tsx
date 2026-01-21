import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSEncrypt from 'jsencrypt';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { APIResponse } from '../types';
import { AxiosError } from 'axios'; // Import cái này
import { registerService } from '../services/registerService';

const RegisterPage = ()=> {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    //state form 
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        //validate so bo
        if(!username || !email || !password || !phone) {
            toast.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        setIsLoading(true);
        try{
            // buoc 1 lay public key tu server
            const keyData  = await registerService.getPublicKey();

            //buoc 2 ma hoa ps tai client0
            const encryptor = new JSEncrypt();
            encryptor.setPublicKey(keyData.publicKey);
            const encryptedPassword = encryptor.encrypt(password);
            if(!encryptedPassword) {
                toast.error('Mã hóa mật khẩu thất bại!');       
                return;
            }
            //buoc 3 gui ve api
            const result = await registerService.register({
                username: username,
                email: email,
                encryptedPassword: encryptedPassword,
                phone: phone
            });
            toast.success(result.message);
            setTimeout(() => navigate('/login'),2000);
        } catch (error) {
              const axiosError = error as AxiosError<APIResponse>;
           // Xử lý lỗi (Validation từ Server trả về)
            const responseData = axiosError.response?.data;
            if (responseData && Array.isArray(responseData)) {
                // Nếu có nhiều lỗi (do FluentValidation trả về mảng)
                responseData.forEach((err: string) => toast.error(err));
            } else {
                // Lỗi đơn lẻ
                const msg = responseData?.error || "Đăng ký thất bại";
                toast.error(msg);
            }
        }
        finally 
        {
                setIsLoading(false);
        }
        };
        return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial' }}>
            <h1>📝 Đăng Ký DigiBank</h1>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <input 
                    type="text" placeholder="Họ và tên đầy đủ" 
                    value={username} onChange={e => setUsername(e.target.value)} 
                    style={{ padding: '10px' }}
                />
                
                <input 
                    type="password" placeholder="Mật khẩu (Có chữ hoa, số)" 
                    value={password} onChange={e => setPassword(e.target.value)} 
                    style={{ padding: '10px' }}
                />
                
                <input 
                    type="text" placeholder="Số điện thoại" 
                    value={phone} onChange={e => setPhone(e.target.value)} 
                    style={{ padding: '10px' }}
                />
                
                <input 
                    type="email" placeholder="Email" 
                    value={email} onChange={e => setEmail(e.target.value)} 
                    style={{ padding: '10px' }}
                />

                <button 
                    type="submit" disabled={isLoading}
                    style={{ 
                        padding: '12px', background: isLoading ? '#ccc' : '#28a745', 
                        color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {isLoading ? '⏳ ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
                </button>
            </form>
            <ToastContainer />
        </div>
    );
    };
    export default RegisterPage;
