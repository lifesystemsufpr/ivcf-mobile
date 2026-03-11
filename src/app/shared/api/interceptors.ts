import { httpClient } from "./httpClient";
import { useAuthStore } from "../../features/auth";

httpClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;


    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});
