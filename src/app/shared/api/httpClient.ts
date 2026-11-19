import axios from "axios";


const baseUrl = "https://app.ivcf.com.br/api";

export const httpClient = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});