// Central API configuration for resolving API Gateway URL
const devBaseUrl = 'https://zq1dj3ag6d.execute-api.ap-southeast-1.amazonaws.com/prod/api/v1';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || devBaseUrl;

console.log('Using API Base URL:', API_BASE_URL);
