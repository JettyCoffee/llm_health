import axios from 'axios';

const API_BASE_URL = '/api';

export const submitAnalysis = async (data: {
  userId: string;
  facialData: string;
  voiceData?: string;
  heartRateData?: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/llm`, data);
  return response.data;
};

export const getHistory = async (userId: string) => {
  const response = await axios.get(`${API_BASE_URL}/history?userId=${userId}`);
  return response.data;
};
