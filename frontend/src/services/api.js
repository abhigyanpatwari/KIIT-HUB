// API service for centralized backend URL configuration

// Use environment variables for production deployments, fallback to localhost for development
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL;

// Ensure API_URL doesn't end with a slash
const normalizedApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

// Log the backend URL being used
console.log('API service initialized with URL:', normalizedApiUrl);
console.log('Socket URL:', SOCKET_URL);

// Helper function for making API calls with the correct URL
export const apiCall = async (endpoint, options = {}) => {
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Create the final URL with no double slashes
  const url = `${normalizedApiUrl}${normalizedEndpoint}`;
  
  // Default options for fetch
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // Make credentials optional based on endpoint
    credentials: normalizedEndpoint.includes('/socket.io') ? 'omit' : 'include'
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
    console.log(`Making API call to: ${url} with credentials: ${fetchOptions.credentials}`);
    const response = await fetch(url, fetchOptions);
    
    // Log response status
    console.log(`API response status: ${response.status}`);
    
    if (response.status === 404) {
      console.error(`API endpoint not found: ${normalizedEndpoint}`);
      throw new Error(`API endpoint not found: ${normalizedEndpoint}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    // Add more detailed error info
    if (error.message === 'Failed to fetch') {
      console.error('This likely indicates a network issue or CORS problem. Check that the backend is accessible.');
    }
    throw error;
  }
};

// Helper function for testing CORS connectivity
export const testCorsConnection = async () => {
  try {
    console.log('Testing CORS connection to backend...');
    const url = `${normalizedApiUrl}/cors-test`;
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('CORS test result:', data);
    return data;
  } catch (error) {
    console.error('CORS test failed:', error);
    throw error;
  }
};

// Export default for convenience
export default {
  API_URL: normalizedApiUrl,
  SOCKET_URL,
  apiCall,
  testCorsConnection
}; 