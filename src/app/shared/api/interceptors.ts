import { httpClient } from "./httpClient";
import { useAuthStore } from "../../features/auth";

httpClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;


    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
