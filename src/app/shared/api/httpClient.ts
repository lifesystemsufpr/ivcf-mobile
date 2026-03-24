import axios from "axios";


const baseUrl = __DEV__ ? "http://200.236.3.109/backend" : "http://200.236.3.109/backend";

export const httpClient = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});