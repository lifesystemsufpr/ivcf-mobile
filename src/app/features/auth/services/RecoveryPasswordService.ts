import { recoveryPasswordApi } from "../api/recoveryPasswordApi";


export async function recoverPassword(data: { email: string }) {
    await recoveryPasswordApi.create(data);
}