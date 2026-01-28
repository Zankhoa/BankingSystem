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

export interface LoginRequest{
    Username: string;
    EncryptedPassword: string;
}
export interface LoginRespose{
message: string;
sessionSecret: string;
}

export interface AuthContextType{
    user: UserInfoDTO | null;
    isAuthenticated: boolean;
    name: string;
    isLoading: boolean; //bien nay quan trong de the hien tren man hinh hco
    loginContext: () => void;
    logoutContext: () => void;
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
export interface PublicKeyResponse {
    publicKey: string;
}

export interface UserInfoDTO{
userName: string;
balance: number;
}

export interface TransferRequest{
    requestId: string;
    AmountMoney: number;
    Types: string;
    Description: string;
    ReceiverAccountNumber: string;
    Pin: string;
}
export interface TransferResponse{
message: string;
}
export interface GetInfoRequest{
accountNumber: string,
}
export interface GetInfoResponse{
userName: string,
}

