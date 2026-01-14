import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
 const { isAuthenticated, isLoading } = useAuth();

 //1 trang thai cho: khi context dang goi api check token
 //hien thi mot loading
if(isLoading){
 return (
            <div style={{ 
                height: "100vh", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                flexDirection: "column"
            }}>
                <div className="spinner" style={{ 
                    width: "40px", height: "40px", 
                    border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", 
                    borderRadius: "50%", animation: "spin 1s linear infinite" 
                }}></div>
                <p style={{ marginTop: "10px", color: "#666" }}>Đang xác thực bảo mật...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }
        //2 xac thuc xong
        //neu true cho vao trang con outlet
        //neu false da ve login
        return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace/>;
 };
 export default ProtectedRoute;
