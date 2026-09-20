import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach user info or tokens if available
API.interceptors.request.use((config) => {
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Asynchronous Batch Ranking API Helpers ---

/**
 * Submits job ID, qualifications, and resume files to initiate background batch processing.
 */
export const startBatchRanking = async (jobId: string, jobQualifications: string, files: File[]) => {
  const formData = new FormData();
  formData.append('job_id', jobId);
  formData.append('job_qualifications', jobQualifications);
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await API.post('/rank', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data; // Returns { batch_id: string, message: string }
};

/**
 * Polls the backend for live progress and completed results using the unique batch ID.
 */
export const getBatchStatus = async (batchId: string) => {
  const response = await API.get(`/rank-batch/${batchId}`);
  return response.data; // Returns { status, total, completed, results }
};

export default API;