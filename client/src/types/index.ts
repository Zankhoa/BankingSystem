//du lieu gui di(giong withcommand voi ben backend)
export interface WithdrawRequest {
  accountId: string;
  amount: number;
}
// Dữ liệu nhận về (API trả về success và message)
export interface APIResponse {
  success: boolean;
  message: string;
  error: string;
}

export interface LoginRequest {
  Username: string;
  EncryptedPassword: string;
}
export interface LoginRespose {
  message: string;
  sessionSecret: string;
}

export interface AuthContextType {
  user: UserInfoDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean; //bien nay quan trong de the hien tren man hinh hco
  loginContext: () => void;
  logoutContext: () => void;
}

export interface RegisterRequest {
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

export interface UserInfoDTO {
  userName: string;
  balance: number;
  hasPin: boolean;
}

export interface TransferRequest {
  RequestId: string;
  AmountMoney: number;
  Types: string;
  Description: string;
  ReceiverAccountNumber: string;
  Pin: string;
}
export interface TransferResponse {
  message: string;
}
export interface GetInfoRequest {
  accountNumber: string;
}
export interface GetInfoResponse {
  userName: string;
}
export interface CreatePinUserRequest {
  PinHash: string;
  PasswordHash: string;
}
export interface CreatePinUserResponse {
  result: boolean;
}
export interface TransactionHistoryRequest {
  FromDate: Date;
  ToDate: Date;
  page: number;
  pageSize: number;
  SearchData: string;
}
export interface TransactionHisoryResponse {
  code: string;
  createAt: string;     // BE trả về string ISO, không phải Date object ngay lập tức
  userReceveir: string;
  amountMoney: number;  // Viết thường chữ a
  status: string;
  description: string;
}

export interface TotalMoneyResponse{
   totalMoney: number;
   moneyIn: number;
   moneyOut: number;
}
export interface GetDataChartResponse{
  moneyIn: number;
  moneyOut: number;
  date: string;
}
export interface DashboardRequest{
  FromDate?: Date;
  ToDate?: Date;
}
export interface TransactionHisoryDashboardResponse {
  code: string;
  createAt: string;    
  usersTransaction: string;
  amountMoney: number; 
  status: string;
  description: string;
}

