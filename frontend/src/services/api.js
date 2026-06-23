const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api/transactions' 
  : '/api/transactions';

export const fetchTransactions = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.limit) queryParams.append('limit', filters.limit);

  const url = `${API_BASE_URL}?${queryParams.toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch transactions');
  }
  return data.data;
};

export const fetchTransactionById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch transaction details');
  }
  return data.data;
};

export const createTransaction = async (transactionData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactionData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(Array.isArray(data.error) ? data.error.join(', ') : (data.error || 'Failed to create transaction'));
  }
  return data.data;
};

export const updateTransaction = async (id, transactionData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactionData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(Array.isArray(data.error) ? data.error.join(', ') : (data.error || 'Failed to update transaction'));
  }
  return data.data;
};

export const deleteTransaction = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete transaction');
  }
  return data;
};

export const fetchStats = async () => {
  const response = await fetch(`${API_BASE_URL}/stats`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch statistics');
  }
  return data.data;
};
