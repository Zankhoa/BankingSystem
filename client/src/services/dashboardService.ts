import axiosClient from "../api/axiosClient"
import type { GetDataChartResponse, TotalMoneyResponse, TransactionHisoryDashboardResponse, DashboardRequest } from "../types"

export const dashboardService = {
    GetDataMoney: async (data : DashboardRequest)=> {
        const result = await axiosClient.post<TotalMoneyResponse>("/Dashboard/total-money", data);
        return result.data;
    },
    GetDataChart: async(data: DashboardRequest) => {
        const result = await axiosClient.post<GetDataChartResponse[]>("/Dashboard/data-chart", data);
        return result.data;
    },
    GetHistoryTransaction: async(data: DashboardRequest)=>{
         const result = await axiosClient.post<TransactionHisoryDashboardResponse[]>("/Dashboard/data-history", data);
        return result.data;
    }
    
} 