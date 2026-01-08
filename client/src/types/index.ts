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
