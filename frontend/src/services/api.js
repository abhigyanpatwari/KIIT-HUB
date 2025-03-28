// API service for centralized backend URL configuration

// Use environment variables for production deployments, fallback to localhost for development
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL;

// Log the backend URL being used
console.log('API service initialized with URL:', API_URL);
console.log('Socket URL:', SOCKET_URL);

// Helper function for making API calls with the correct URL
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Default options for fetch
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include'
  };
  
  // Merge default options with provided options
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
};

// Export default for convenience
export default {
  API_URL,
  SOCKET_URL,
  apiCall
}; 