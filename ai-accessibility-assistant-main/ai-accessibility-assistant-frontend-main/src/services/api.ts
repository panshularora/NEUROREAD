import axios from 'axios';
import type { SimplifyRequest, SimplifyResponse, ProgressResponse } from '../types/apiTypes';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 15000
});

export const postSimplify = async (payload: SimplifyRequest): Promise<SimplifyResponse> => {
  const { data } = await apiClient.post<SimplifyResponse>('/simplify', payload);
  return data;
};

export const getProgress = async (userId: string): Promise<ProgressResponse> => {
  const { data } = await apiClient.get<ProgressResponse>(`/progress/${encodeURIComponent(userId)}`);
  return data;
};

