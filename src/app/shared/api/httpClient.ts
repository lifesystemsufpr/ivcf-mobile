import axios from "axios";


const baseUrl = "https://ivcf.com.br/backend";

export const httpClient = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});