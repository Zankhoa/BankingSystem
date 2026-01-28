import { createContext, useState, useEffect, useContext } from "react";
import type { AuthContextType, UserInfoDTO } from "../types";
import { authService } from "../services/authService";
import type { APIResponse } from '../types';
import { AxiosError } from 'axios'; // Import cái này
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserInfoDTO | null>(null);
    const [name, setName] = useState<string>("");
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // F5: Gọi API check xem Cookie còn sống không
    useEffect(() => {
        const initAuth = async () => {
            try {
                const userInfo = await authService.getCurrentUser();
                console.log("Current User:", userInfo);
                setUser(userInfo);
                setIsAuthenticated(true);
                setName(userInfo.userName);
            } catch {
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    // Hàm gọi sau khi bấm nút Login thành công
    const loginContext = async () => {
        setIsLoading(true);
        try {
            const userInfo = await authService.getCurrentUser();
            setUser(userInfo);
            setIsAuthenticated(true);
            setName(userInfo.userName);
        } catch(error) {  const axiosError = error as AxiosError<APIResponse>;
              console.error("Login error:", axiosError); } 
        finally { setIsLoading(false); }
    };

    const logoutContext = async () => {
        try 
        {
             await authService.logout(); 
        } catch(error) 
        {
            console.error(error);
        }
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ name, user, isAuthenticated, isLoading, loginContext, logoutContext }}>
            {children}
        </AuthContext.Provider>
    );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};