import { createContext, useState, useEffect, useContext} from "react";
import type { AuthContextType, AccountInfo } from "../types";
import { authService } from "../services/authService";

const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children } : { children: React.ReactNode }) => {
    const [user, setUser] = useState<AccountInfo | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true); //mac dinh la dang loading

    //logic chay khi f5 trang web
    useEffect(() => {
    const initialzeAuth = async () => {
        const token = localStorage.getItem("accessToken");

        //1 neu khong co token => dung loading, xac nhan chua login
        if(!token){
            setIsLoading(false);
            setIsAuthenticated(false);
            setUser(null);
            return;
        }

        //2 neu co token => goi api kiem tra tinh hop le
        try{
            const userData = await authService.getCurrentUser();
            //neu api ok (200) token hop le
            setUser(userData);
            setIsAuthenticated(true);
        }catch(error){
            //neu api loi (401) token ko hop le
            console.error("Error during authentication initialization:", error);
            localStorage.clear(); // Xóa sạch dấu vết
            setUser(null);
            setIsAuthenticated(false);
        }finally{
        //du dung hay sai qua trinh kiem tra da xong 
        setIsLoading(false);
        }
    };
    initialzeAuth();

    }, []);

    //ham login(khi bam nut thanh cong)}
    const login = (token: string, accountId: string) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("accountId", accountId);
    setIsAuthenticated(true);
    //co the goi goi getcurrentuser de lay thong tin user
    };

    //ham logout
    const logout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUser(null);
    };
    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
    };

    //hook de dung nhanh o cac componet khac
    // eslint-disable-next-line react-refresh/only-export-components
    export const useAuth = () =>{
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
    };

