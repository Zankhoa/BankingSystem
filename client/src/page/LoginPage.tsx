import { useState } from "react";
import type { APIResponse } from '../types';
import { AxiosError } from 'axios'; // Import cái này
import { Navigate, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import JSEncrypt from "jsencrypt";
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginContext, isAuthenticated } = useAuth(); // Lấy hàm login từ Context
  const navigate = useNavigate();
  //neu da login thi chuyen ve trang chu
  if (isAuthenticated) {
    return <Navigate to="/withdraw" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // setIsSubmitting(true);
    try {
      //B1: lay RSA key
      const keyData = await authService.getPublicKey();
      //b2: ma hoa password
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(keyData.publicKey);
      const encryptedPassword = encryptor.encrypt(password);

      if (!encryptedPassword) {
        toast.error("Password encryption failed. Please try again.");
        return;
      }
      //b3 goi login api(Server set cooki)
       await authService.login({
        Username: username,
        EncryptedPassword: encryptedPassword,
      });
      await loginContext();
      //2 cap nhan context se dc tu luu vao storegarge
      // login(data.token, data.accountId);
      toast.success("login successful!");
      //  setTimeout(() => navigate('/withdraw'),2000);
      //3 dieu huong ve trang atm
      navigate("/withdraw");
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast.error(axiosError.response?.data.message);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      style={{
        padding: "50px",
        maxWidth: "400px",
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <h1>📝 login DigiBank</h1>
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "10px" }}
        />

        <input
          type="password"
          placeholder="Mật khẩu (Có chữ hoa, số)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px" }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "12px",
            background: isLoading ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {isLoading ? "⏳ ĐANG XỬ LÝ..." : "ĐĂNG KÝ NGAY"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};
export default LoginPage;
