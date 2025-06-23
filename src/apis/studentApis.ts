import axios from "axios";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;
const jsonconfig = { withCredentials: true };

export const addStudent = async (formData: any) => {
    try {
    let res = await axios.post(`${backEndUrl}/student/add`, formData, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};

export const updateStudent = async (formData: any,studentId:any) => {
    try {
    let res = await axios.put(`${backEndUrl}/student/update?id=${studentId}`, formData, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteStudent = async (studentId: any) => {
    try {
    let res = await axios.delete(`${backEndUrl}/student/delete?id=${studentId}`, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getAllStudents = async () => {
    try {
    let res = await axios.get(`${backEndUrl}/student/all`, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};