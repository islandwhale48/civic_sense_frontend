const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Base HTTP request wrapper with JSON handling and resilience
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...options.headers
  };

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || `HTTP ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.warn(`[API Notice] ${endpoint}:`, err.message);
    throw err;
  }
}

export default apiRequest;
