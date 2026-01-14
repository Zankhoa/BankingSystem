//du lieu gui di(giong withcommand voi ben backend)
export interface WithdrawRequest{
    accountId: string;
    amount: number;
}
// Dữ liệu nhận về (API trả về success và message)
export interface APIResponse{
    success: boolean;
    message: string;
    error: string;
}

export interface LoginRespose{
    token: string;
    usename: string;
    accountId: string; //backend nen tra ve cai nay de frontend luu lai
}
export interface AccountInfo{
username: string;
role: string;
//them mot vai thongt in khac neu can thiet
}

export interface AuthContextType{
    user: AccountInfo | null;
    isAuthenticated: boolean;
    isLoading: boolean; //bien nay quan trong de the hien tren man hinh hco
    login: (token: string, accountId: string) => void;
    logout: () => void;
}

export interface RegisterRequest{
username: string;
encryptedPassword: string;
email: string;
phone: string;
}
export interface RegisterResponse {
    message: string; // Backend trả về: "Đăng ký thành công..."
}
export interface PublicKeyResponse {
    publicKey: string;
}

