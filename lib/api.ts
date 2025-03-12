const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  console.log(`Making ${options.method || 'GET'} request to ${endpoint}`, 
    options.body ? JSON.parse(options.body as string) : 'No body');

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`API Error (${response.status}):`, text);
      
      try {
        const data = JSON.parse(text);
        throw new Error(data.detail ? 
          (Array.isArray(data.detail) ? 
            `Validation error: ${data.detail.map((e: {loc: any[], msg: string}) => `${e.loc[1]}: ${e.msg}`).join(', ')}` : 
            data.detail) : 
          `Error ${response.status}: ${response.statusText}`
        );
      } catch (e) {
        if (e instanceof SyntaxError) {
          throw new Error(`Error ${response.status}: ${text || response.statusText}`);
        }
        throw e;
      }
    }

    // If the response is empty, return null instead of trying to parse JSON
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('CORS error or network failure:', error);
      throw new Error(
        'Unable to connect to the server. This might be due to CORS restrictions. ' +
        'Please ensure the backend allows requests from this domain.'
      );
    }
    throw error;
  }
}

// Helper methods for common operations
export const api = {
  get: (endpoint: string) => fetchWithAuth(endpoint),
  
  post: (endpoint: string, data: any) => 
    fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: (endpoint: string, data: any) => 
    fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (endpoint: string) => 
    fetchWithAuth(endpoint, {
      method: 'DELETE',
    }),

  // Specific method for fetching prediction data
  getPredictionById: async (id: string) => {
    try {
      console.log(`Fetching prediction with ID: ${id}`);
      const response = await fetchWithAuth(`/api/data/${id}`);
      console.log('API response for prediction:', response);
      return response;
    } catch (error: unknown) {  
      console.error(`Error fetching prediction ${id}:`, error);
      throw error;
    }
  }
};