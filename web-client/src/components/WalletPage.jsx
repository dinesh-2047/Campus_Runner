import { useEffect, useState } from "react";

import { apiClient } from "../api/client";
import { useAppContext } from "../context/AppContext";

const initialTransactionForm = {
  userId: "",
  amount: "",
  description: "",
  reference: "",
  status: "completed",
  type: "credit",
};

export function WalletPage() {
  const { session } = useAppContext();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ status: "", type: "", userId: "" });
  const [form, setForm] = useState(initialTransactionForm);
  const [updateForm, setUpdateForm] = useState({ transactionId: "", status: "failed", failureReason: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadWallet = async () => {
    if (session.status !== "authenticated") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [balancePayload, transactionsPayload] = await Promise.all([
        apiClient.getWalletBalance(),
        apiClient.getWalletTransactions(filters),
      ]);
      setBalance(balancePayload.data);
      setTransactions(transactionsPayload.data.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, [session.status, filters.status, filters.type, filters.userId]);

  const handleCreateTransaction = async (event) => {
    event.preventDefault();
    setBusy("create");
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (form.type === "credit") {
        await apiClient.createWalletCredit(payload);
      } else {
        await apiClient.createWalletDebit(payload);
      }

      setForm(initialTransactionForm);
      setSuccess("Wallet transaction created.");
      await loadWallet();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const handleUpdateStatus = async (event) => {
    event.preventDefault();
    setBusy("update");
    setError("");
    setSuccess("");

    try {
      await apiClient.updateWalletTransactionStatus(updateForm.transactionId, {
        status: updateForm.status,
        failureReason: updateForm.failureReason,
      });
      setSuccess("Transaction status updated.");
      setUpdateForm({ transactionId: "", status: "failed", failureReason: "" });
      await loadWallet();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  if (session.status !== "authenticated") {
    return (
      <section className="placeholder-page">
        <span className="eyebrow">Wallet</span>
        <h1>Sign in to access wallet data</h1>
        <p>The wallet routes are protected and need an authenticated backend session.</p>
      </section>
    );
  }

  return (
    <section className="workspace-grid">
      <div className="workspace-main">
        <div className="workspace-header">
          <div>
            <span className="eyebrow">Wallet</span>
            <h1>Balance and transactions</h1>
          </div>
        </div>

        {error ? <p className="form-message form-message--error">{error}</p> : null}
        {success ? <p className="form-message form-message--success">{success}</p> : null}

        {balance ? (
          <div className="wallet-summary-grid">
            <article className="summary-card">
              <span>Current balance</span>
              <strong>Rs {balance.currentBalance}</strong>
            </article>
            <article className="summary-card">
              <span>Total credited</span>
              <strong>Rs {balance.totalCredited}</strong>
            </article>
            <article className="summary-card">
              <span>Total debited</span>
              <strong>Rs {balance.totalDebited}</strong>
            </article>
            <article className="summary-card">
              <span>Pending debits</span>
              <strong>Rs {balance.pendingDebits}</strong>
            </article>
          </div>
        ) : null}

        <div className="toolbar-card">
          <label>
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </label>
          <label>
            <span>Type</span>
            <select
              value={filters.type}
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            >
              <option value="">All</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </label>
          {session.user.role === "admin" ? (
            <label>
              <span>User ID</span>
              <input
                value={filters.userId}
                onChange={(event) => setFilters((current) => ({ ...current, userId: event.target.value }))}
              />
            </label>
          ) : null}
        </div>

        {loading ? <p className="empty-state">Loading wallet data...</p> : null}
        {!loading && transactions.length === 0 ? <p className="empty-state">No transactions found.</p> : null}

        <div className="resource-list">
          {transactions.map((transaction) => (
            <article key={transaction.id} className="resource-card">
              <div className="resource-card__header">
                <div>
                  <h3>{transaction.description}</h3>
                  <p>{transaction.reference || "No reference"}</p>
                </div>
                <span className={`status-chip status-chip--${transaction.status}`}>{transaction.status}</span>
              </div>
              <div className="resource-card__meta">
                <span>{transaction.type}</span>
                <span>Rs {transaction.amount}</span>
                <span>{transaction.user?.fullName || "Unknown user"}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="workspace-side">
        {session.user.role === "admin" ? (
          <>
            <div className="workspace-panel">
              <span className="eyebrow">Manual entry</span>
              <h2>Create wallet transaction</h2>
              <form className="form-grid" onSubmit={handleCreateTransaction}>
                <label>
                  <span>Type</span>
                  <select
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </label>
                <label>
                  <span>User ID</span>
                  <input
                    value={form.userId}
                    onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0.01"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  <span>Description</span>
                  <input
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  <span>Reference</span>
                  <input
                    value={form.reference}
                    onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))}
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </label>
                <button className="button button--primary" disabled={busy === "create"} type="submit">
                  {busy === "create" ? "Saving..." : "Create Transaction"}
                </button>
              </form>
            </div>

            <div className="workspace-panel">
              <span className="eyebrow">Status update</span>
              <h2>Update transaction</h2>
              <form className="form-grid" onSubmit={handleUpdateStatus}>
                <label>
                  <span>Transaction ID</span>
                  <input
                    value={updateForm.transactionId}
                    onChange={(event) =>
                      setUpdateForm((current) => ({ ...current, transactionId: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={updateForm.status}
                    onChange={(event) =>
                      setUpdateForm((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </label>
                <label>
                  <span>Failure reason</span>
                  <input
                    value={updateForm.failureReason}
                    onChange={(event) =>
                      setUpdateForm((current) => ({ ...current, failureReason: event.target.value }))
                    }
                  />
                </label>
                <button className="button button--primary" disabled={busy === "update"} type="submit">
                  {busy === "update" ? "Updating..." : "Update Status"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="workspace-panel">
            <span className="eyebrow">Wallet role</span>
            <h2>Read-only client for non-admin users</h2>
            <p>Non-admin users can inspect their own wallet balance and transaction history here.</p>
          </div>
        )}
      </aside>
    </section>
  );
}