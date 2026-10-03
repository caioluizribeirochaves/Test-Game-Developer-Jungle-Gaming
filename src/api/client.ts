import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '',
  timeout: 4500, // 4.5 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});
