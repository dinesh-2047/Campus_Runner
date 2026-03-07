const DEFAULT_BASE_URL = "http://localhost:3000/api/v1";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const apiClient = {
  getHealth() {
    return request("/health", { method: "GET" });
  },
  verifySession() {
    return request("/auth/verify", { method: "GET" });
  },
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  logout() {
    return request("/auth/logout", { method: "POST" });
  },
  getProtectedActions() {
    return request("/tasks/protected-actions", { method: "GET" });
  },
  getOpenTasks() {
    return request("/tasks/open", { method: "GET" });
  },
  getTasks(filters = {}) {
    return request(`/tasks${buildQueryString(filters)}`, { method: "GET" });
  },
  createTask(payload) {
    return request("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  acceptTask(taskId) {
    return request(`/tasks/${taskId}/accept`, { method: "PATCH" });
  },
  markTaskInProgress(taskId) {
    return request(`/tasks/${taskId}/in-progress`, { method: "PATCH" });
  },
  completeTask(taskId) {
    return request(`/tasks/${taskId}/complete`, { method: "PATCH" });
  },
  cancelTask(taskId, payload) {
    return request(`/tasks/${taskId}/cancel`, {
      method: "PATCH",
      body: JSON.stringify(payload || {}),
    });
  },
  getWalletBalance() {
    return request("/wallet/balance", { method: "GET" });
  },
  getWalletTransactions(filters = {}) {
    return request(`/wallet/transactions${buildQueryString(filters)}`, { method: "GET" });
  },
  createWalletCredit(payload) {
    return request("/wallet/transactions/credit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createWalletDebit(payload) {
    return request("/wallet/transactions/debit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateWalletTransactionStatus(transactionId, payload) {
    return request(`/wallet/transactions/${transactionId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  getReports(filters = {}) {
    return request(`/admin/reports${buildQueryString(filters)}`, { method: "GET" });
  },
  updateReportStatus(reportId, payload) {
    return request(`/admin/reports/${reportId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  suspendUser(userId, payload) {
    return request(`/admin/users/${userId}/suspend`, {
      method: "PATCH",
      body: JSON.stringify(payload || {}),
    });
  },
  archiveTask(taskId, payload) {
    return request(`/admin/tasks/${taskId}/archive`, {
      method: "PATCH",
      body: JSON.stringify(payload || {}),
    });
  },
};

export { apiBaseUrl, apiClient };