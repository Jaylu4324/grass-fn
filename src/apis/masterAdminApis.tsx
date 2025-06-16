import axios from "axios";

const back_End_url = import.meta.env.VITE_BACK_END_URL
const jsonconfig = { withCredentials: true }

export const login = async (formData: any) => {
    try {
    
        let res = await axios.post(`${back_End_url}/masterAdmin/login`, formData, jsonconfig)
        return res
    } catch (error) {
        throw error
    }
}
export const forgetpassword = async (formData: any) => {
    try {
        let res = await axios.post(`${back_End_url}/masterAdmin/forgetPassword`, formData)
        return res
    } catch (error) {
        throw error
    }
}
export const resetPassword = async (formData: any, token: any) => {
    try {
        let res = await axios.post(`${back_End_url}/masterAdmin/resetPassword?token=${token}`, formData)
        return res
    } catch (error) {
        throw error
    }
}
export const adminProfile = async () => {
    try {
        let res = await axios.get(`${back_End_url}/masterAdmin/adminProfile`, jsonconfig)
        return res
    } catch (error) {
        throw error
    }
}