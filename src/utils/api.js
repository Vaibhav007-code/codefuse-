// src/utils/api.js
import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'  // For production
  : 'http://localhost:3000/api';  // For development

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const fetchContests = async () => {
  try {
    // First check if API is accessible
    await axiosInstance.get('/health');
    
    const response = await axiosInstance.get('/contests');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch contests');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching contests:', error);
    throw error;
  }
};