import axiosClient from "../api/axiosClient";
import type {AccountInfo, LoginRespose} from "../types";

export const authService = {
login: async (username: string, password: string) => {
    //ma hoa base64 usernam:password
    const encoded = btoa(`${username}:${password}`);

    //gui qua header, body de trong
    const response = await axiosClient.post<LoginRespose>('/Authentication/login', {}, {
        headers: {
            'Authorization': `Basic ${encoded}`
        }
    });
    return response.data;
},

//2 kiem tra token 
getCurrentUser: async () => {
    // axios client da tu dong gan token vao header
    const response = await axiosClient.get<AccountInfo>('/Authentication/info');
    return response.data;
}
};

