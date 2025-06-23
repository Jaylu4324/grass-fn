import axios from 'axios';

const backEndUrl = import.meta.env.VITE_BACK_END_URL;
const jsonconfig = { withCredentials: true };

export const addQuiz = async (formData: any) => {
  try {
    const res = await axios.post(`${backEndUrl}/quiz/`, formData, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};

export const updateQuiz = async (formData: any, quizId: string) => {
  try {
    const res = await axios.put(`${backEndUrl}/quiz/?id=${quizId}`, formData, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteQuiz = async (quizId: string) => {
  try {
    const res = await axios.delete(`${backEndUrl}/quiz/?id=${quizId}`, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getAllQuizzes = async () => {
  try {
    const res = await axios.get(`${backEndUrl}/quiz/`, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteAllQuizzes = async () => {
  try {
    const res = await axios.delete(`${backEndUrl}/quiz/all`, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteQuizzesByFileName = async (fileName: string) => {
  try {
    const res = await axios.delete(`${backEndUrl}/quiz/file?fileName=${fileName}`, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getQuizzesByFileName = async (fileName: string) => {
  try {
    const res = await axios.get(`${backEndUrl}/quiz/file?fileName=${fileName}`, jsonconfig);
    return res;
  } catch (error) {
    throw error;
  }
};