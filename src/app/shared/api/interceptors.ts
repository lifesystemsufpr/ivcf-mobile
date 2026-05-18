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
        console.group("=== AXIOS ERROR ===");
        console.log("Message:", error.message);
        if (error.config) {
            console.log("Full URL:", (error.config.baseURL || "") + (error.config.url || ""));
            console.log("Method:", error.config.method?.toUpperCase());
            if (error.config.data) {
                try {
                    console.log("Request Data:", JSON.parse(error.config.data));
                } catch {
                    console.log("Request Data:", error.config.data);
                }
            }
        }
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Response Data:", error.response.data);
        } else if (error.request) {
            console.log("Error type: No response received (Network Error / Timeout)");
            console.log("Request details:", error.request);
        }
        console.groupEnd();

        if (error.response && error.response.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
